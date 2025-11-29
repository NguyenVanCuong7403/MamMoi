import React, { useState, useMemo, useEffect } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  Send,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SupportRequestRepository from "@/API/repositories/SupportRequestRepository";
import { useAuth } from "@/API/context/AuthContext";
import { LivingBackground } from "@/components/background";
import { useNavigate } from "react-router-dom";

// Status mapping
const STATUS_MAP = {
  Open: { label: "Mới", color: "bg-blue-50 text-blue-700 border-blue-200" },
  InProgress: {
    label: "Đang xử lý",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  Resolved: {
    label: "Đã giải quyết",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  Closed: {
    label: "Đã đóng",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

// Priority mapping
const PRIORITY_MAP = {
  Low: { label: "Thấp", color: "bg-gray-100 text-gray-700" },
  Normal: { label: "Bình thường", color: "bg-blue-100 text-blue-700" },
  High: { label: "Cao", color: "bg-orange-100 text-orange-700" },
  Urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-700" },
};

// Category mapping
const CATEGORY_MAP = {
  payment: "Thanh toán",
  tree: "Cây",
  auth: "Đăng nhập & Đăng ký",
  system: "Hệ thống",
  other: "Khác",
};

const PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

export default function ReportManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const pageSize = 10;

  // Fetch reports
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const status = statusFilter === "all" ? null : statusFilter;
      const response = await SupportRequestRepository.getUserRequests(
        1,
        100,
        status
      );

      // API returns { success: true, data: [...], pagination: {...} }
      if (response?.success && response?.data) {
        setReports(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setReports(response);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        report.subject?.toLowerCase().includes(searchLower) ||
        report.ticketNumber?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [reports, search]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const currentPageReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    } else if (totalPages === 0) {
      setPage(1);
    }
  }, [filteredReports.length, totalPages, page]);

  // Open detail modal
  const openDetailModal = (report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  // Open feedback modal
  const openFeedbackModal = (report) => {
    setSelectedReport(report);
    setFeedback({ rating: 0, comment: "" });
    setIsFeedbackModalOpen(true);
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!selectedReport || feedback.rating === 0) {
      alert("Vui lòng chọn đánh giá từ 1-5 sao");
      return;
    }

    try {
      setSubmittingFeedback(true);
      await SupportRequestRepository.submitFeedback(selectedReport.requestId, {
        satisfactionRating: feedback.rating,
        feedback: feedback.comment || null,
      });

      alert("Cảm ơn bạn đã gửi phản hồi!");
      setIsFeedbackModalOpen(false);
      setSelectedReport(null);
      setFeedback({ rating: 0, comment: "" });
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(
        error.message || "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại."
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if report can receive feedback
  const canSubmitFeedback = (report) => {
    return (
      (report.status === "Resolved" || report.status === "Closed") &&
      !report.satisfactionRating
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-lg">
          Vui lòng đăng nhập để xem báo cáo của bạn
        </p>
      </div>
    );
  }

  return (
    <>
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      <div className="relative min-h-screen pt-[64px] z-10">
        <div className="mm-fluid-shell mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10 2xl:px-16 pt-8 pb-16">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-[clamp(28px,4.5vw,48px)] font-bold text-white mb-3 mm-text-wrap-safe break-words">
                  Quản lý báo cáo
                </h1>
                <p className="text-white/80 text-[clamp(14px,1.8vw,18px)] mm-text-wrap-safe break-words">
                  Xem và quản lý các báo cáo bạn đã gửi
                </p>
              </div>
              <Button
                onClick={() => navigate("/report")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base font-semibold w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                Tạo báo cáo mới
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block">Tìm kiếm</Label>
                <Input
                  placeholder="Tìm theo tiêu đề, mã ticket, nội dung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/95 border-white/30"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/95 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Open">Mới</SelectItem>
                    <SelectItem value="InProgress">Đang xử lý</SelectItem>
                    <SelectItem value="Resolved">Đã giải quyết</SelectItem>
                    <SelectItem value="Closed">Đã đóng</SelectItem>
                    <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 text-center">
              <p className="text-white text-lg">Đang tải...</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/10 hover:bg-white/10">
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Mã ticket
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Tiêu đề
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Phân loại
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Độ ưu tiên
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Ngày gửi
                      </TableHead>
                      <TableHead className="text-white font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageReports.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-16 text-white/80 text-lg"
                        >
                          Không tìm thấy báo cáo nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPageReports.map((report) => (
                        <TableRow
                          key={report.requestId}
                          className="hover:bg-white/5 border-white/10"
                        >
                          <TableCell className="text-white text-[clamp(14px,1.8vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                            {report.ticketNumber || `#${report.requestId}`}
                          </TableCell>
                          <TableCell className="text-white text-[clamp(14px,1.8vw,18px)] py-6 px-6 min-w-0">
                            <div
                              className="max-w-xs mm-text-wrap-safe break-words"
                              title={report.subject}
                            >
                              {report.subject}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80 text-[clamp(13px,1.6vw,16px)] py-6 px-6 mm-text-wrap-safe break-words">
                            {CATEGORY_MAP[report.category] ||
                              report.category ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="py-6 px-6">
                            <Badge
                              className={
                                PRIORITY_MAP[report.priority]?.color ||
                                "bg-gray-100 text-gray-700"
                              }
                            >
                              {PRIORITY_MAP[report.priority]?.label ||
                                report.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6 px-6">
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[clamp(12px,1.5vw,16px)] font-medium border mm-text-wrap-safe break-words ${
                                STATUS_MAP[report.status]?.color ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
                              {STATUS_MAP[report.status]?.label ||
                                report.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-white/80 text-[clamp(13px,1.6vw,16px)] py-6 px-6 mm-text-wrap-safe break-words">
                            {formatDate(report.requestDate)}
                          </TableCell>
                          <TableCell className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 border border-white/30"
                                onClick={() => openDetailModal(report)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Chi tiết
                              </Button>
                              {canSubmitFeedback(report) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20 border border-white/30"
                                  onClick={() => openFeedbackModal(report)}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Đánh giá
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredReports.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-lg text-white/80 font-medium">
                Hiển thị {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, filteredReports.length)} /{" "}
                {filteredReports.length} báo cáo
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-lg text-white/80 font-medium">
                  Trang {page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  Chi tiết báo cáo
                </DialogTitle>
              </DialogHeader>

              {selectedReport && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Mã ticket
                      </Label>
                      <p className="text-gray-900 font-semibold text-lg mt-1">
                        {selectedReport.ticketNumber ||
                          `#${selectedReport.requestId}`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Trạng thái
                      </Label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium border ${
                            STATUS_MAP[selectedReport.status]?.color ||
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {STATUS_MAP[selectedReport.status]?.label ||
                            selectedReport.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 font-medium">Tiêu đề</Label>
                    <p className="text-gray-900 font-semibold text-lg mt-1">
                      {selectedReport.subject}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Phân loại
                      </Label>
                      <p className="text-gray-900 text-base mt-1">
                        {CATEGORY_MAP[selectedReport.category] ||
                          selectedReport.category ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Độ ưu tiên
                      </Label>
                      <div className="mt-1">
                        <Badge
                          className={
                            PRIORITY_MAP[selectedReport.priority]?.color ||
                            "bg-gray-100 text-gray-700"
                          }
                        >
                          {PRIORITY_MAP[selectedReport.priority]?.label ||
                            selectedReport.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 font-medium">
                      Nội dung
                    </Label>
                    <p className="text-gray-900 text-base mt-1 whitespace-pre-wrap">
                      {selectedReport.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Ngày gửi
                      </Label>
                      <p className="text-gray-900 text-base mt-1">
                        {formatDate(selectedReport.requestDate)}
                      </p>
                    </div>
                    {selectedReport.resolvedAt && (
                      <div>
                        <Label className="text-gray-600 font-medium">
                          Ngày giải quyết
                        </Label>
                        <p className="text-gray-900 text-base mt-1">
                          {formatDate(selectedReport.resolvedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedReport.resolution && (
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Giải pháp
                      </Label>
                      <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-900 text-base whitespace-pre-wrap">
                          {selectedReport.resolution}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedReport.satisfactionRating && (
                    <div>
                      <Label className="text-gray-600 font-medium">
                        Đánh giá của bạn
                      </Label>
                      <div className="mt-2 flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= selectedReport.satisfactionRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-gray-700">
                          ({selectedReport.satisfactionRating}/5)
                        </span>
                      </div>
                      {selectedReport.feedback && (
                        <p className="text-gray-700 text-sm mt-2 italic">
                          "{selectedReport.feedback}"
                        </p>
                      )}
                    </div>
                  )}

                  {canSubmitFeedback(selectedReport) && (
                    <div className="pt-4 border-t">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          openFeedbackModal(selectedReport);
                        }}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Gửi đánh giá
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Feedback Modal */}
          <Dialog
            open={isFeedbackModalOpen}
            onOpenChange={setIsFeedbackModalOpen}
          >
            <DialogContent className="max-w-lg bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  Đánh giá báo cáo
                </DialogTitle>
              </DialogHeader>

              {selectedReport && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-600 font-medium mb-3 block">
                      Mức độ hài lòng
                    </Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFeedback({ ...feedback, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-gray-700">
                        {feedback.rating > 0
                          ? `${feedback.rating}/5`
                          : "Chọn số sao"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 font-medium mb-2 block">
                      Nhận xét (tùy chọn)
                    </Label>
                    <Textarea
                      placeholder="Chia sẻ ý kiến của bạn về cách chúng tôi đã xử lý báo cáo này..."
                      value={feedback.comment}
                      onChange={(e) =>
                        setFeedback({ ...feedback, comment: e.target.value })
                      }
                      className="min-h-[120px]"
                      maxLength={1000}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {feedback.comment.length}/1000 ký tự
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={feedback.rating === 0 || submittingFeedback}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submittingFeedback ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Gửi đánh giá
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
