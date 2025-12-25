import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SupportRequestRepository from "@/API/repositories/SupportRequestRepository";
import { useAuth } from "@/API/context/AuthContext";
import { LivingBackground } from "@/components/background";
import LoginGuard from "@/guards/LoginGuard";

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

function SupportRequestDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image preview modal

  // Get API base URL
  const getApiBaseUrl = () => {
    // Check if URL is already absolute
    return import.meta.env.VITE_API_BASE || window.location.origin;
  };

  // Parse attachment URLs and ensure they have proper base URL
  const getAttachmentUrls = (urlString) => {
    if (!urlString) return [];

    console.log('[SupportRequestDetail] Raw attachmentUrls:', urlString);

    let urls = [];
    try {
      // Check if it's a JSON array
      if (urlString.startsWith('[')) {
        urls = JSON.parse(urlString);
      } else {
        // Otherwise, split by comma or semicolon
        urls = urlString.split(/[,;]/).map(url => url.trim()).filter(url => url);
      }
    } catch (e) {
      console.error('[SupportRequestDetail] Error parsing URLs:', e);
      urls = urlString.split(/[,;]/).map(url => url.trim()).filter(url => url);
    }

    // Ensure URLs have proper base URL if they're relative paths
    const baseUrl = getApiBaseUrl();
    const processedUrls = urls.map(url => {
      if (!url) return null;
      // If already absolute URL, return as-is
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      // If relative path starting with /, add base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Otherwise, assume it needs /api/ prefix or just base URL
      return `${baseUrl}/${url}`;
    }).filter(url => url);

    console.log('[SupportRequestDetail] Processed URLs:', processedUrls);
    return processedUrls;
  };

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await SupportRequestRepository.getRequestById(Number(id));
        setRequest(data);
      } catch (err) {
        console.error("Error fetching support request:", err);
        setError(err.message || "Không thể tải thông tin yêu cầu hỗ trợ");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!request || feedback.rating === 0) return;

    try {
      setSubmittingFeedback(true);
      await SupportRequestRepository.submitFeedback(request.requestId, {
        satisfactionRating: feedback.rating,
        feedback: feedback.comment.trim() || null,
      });

      // Refresh request data
      const updated = await SupportRequestRepository.getRequestById(
        request.requestId
      );
      setRequest(updated);
      setIsFeedbackModalOpen(false);
      setFeedback({ rating: 0, comment: "" });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert(
        err.message || "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại."
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

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

  const canSubmitFeedback = (req) => {
    return (
      (req.status === "Resolved" || req.status === "Closed") &&
      !req.satisfactionRating
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-lg">
          Vui lòng đăng nhập để xem yêu cầu hỗ trợ
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <LivingBackground
          baseColor={PALETTE.bg}
          palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
          density={28}
        />
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white text-lg">Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <LivingBackground
          baseColor={PALETTE.bg}
          palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
          density={28}
        />
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg mb-4">
              {error || "Không tìm thấy yêu cầu hỗ trợ"}
            </p>
            <Button
              onClick={() => navigate("/reports")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </>
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
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/reports")}
              className="text-white hover:bg-white/20 mb-3 sm:mb-4 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Quay lại
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-[clamp(28px,4.5vw,48px)] font-bold text-white mb-2 sm:mb-3 mm-text-wrap-safe break-words">
              Chi tiết yêu cầu hỗ trợ
            </h1>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Mã ticket</Label>
                <p className="text-white font-semibold text-base sm:text-lg mt-1">
                  {request.ticketNumber || `#${request.requestId}`}
                </p>
              </div>
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Trạng thái</Label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-medium border ${STATUS_MAP[request.status]?.color ||
                      "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                  >
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current"></span>
                    {STATUS_MAP[request.status]?.label || request.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white/80 font-medium text-sm sm:text-base">Tiêu đề</Label>
              <p className="text-white font-semibold text-base sm:text-lg mt-1">
                {request.subject}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Phân loại</Label>
                <p className="text-white text-sm sm:text-base mt-1">
                  {CATEGORY_MAP[request.category] ||
                    request.category ||
                    "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Độ ưu tiên</Label>
                <div className="mt-1">
                  <Badge
                    className={`text-xs sm:text-sm ${PRIORITY_MAP[request.priority]?.color ||
                      "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {PRIORITY_MAP[request.priority]?.label || request.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white/80 font-medium text-sm sm:text-base">Nội dung</Label>
              <div className="mt-2 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white text-sm sm:text-base whitespace-pre-wrap">
                  {request.description || "Không có mô tả"}
                </p>
              </div>
            </div>

            {/* Attachment Images */}
            {getAttachmentUrls(request.attachmentUrls).length > 0 && (
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Ảnh đính kèm ({getAttachmentUrls(request.attachmentUrls).length})
                </Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {getAttachmentUrls(request.attachmentUrls).map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Ảnh đính kèm ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text fill="%239CA3AF" font-size="12" x="50%" y="50%" text-anchor="middle" dy=".3em">Lỗi tải ảnh</text></svg>';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Ngày gửi</Label>
                <p className="text-white text-sm sm:text-base mt-1">
                  {formatDate(request.requestDate)}
                </p>
              </div>
              {request.resolvedAt && (
                <div>
                  <Label className="text-white/80 font-medium text-sm sm:text-base">
                    Ngày giải quyết
                  </Label>
                  <p className="text-white text-sm sm:text-base mt-1">
                    {formatDate(request.resolvedAt)}
                  </p>
                </div>
              )}
            </div>

            {request.resolution && (
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">Giải pháp</Label>
                <div className="mt-2 p-3 sm:p-4 bg-green-50/20 border border-green-200/30 rounded-lg">
                  <p className="text-white text-sm sm:text-base whitespace-pre-wrap">
                    {request.resolution}
                  </p>
                </div>
              </div>
            )}

            {request.satisfactionRating && (
              <div>
                <Label className="text-white/80 font-medium text-sm sm:text-base">
                  Đánh giá của bạn
                </Label>
                <div className="mt-2 flex items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= request.satisfactionRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                  <span className="ml-1 sm:ml-2 text-white text-sm sm:text-base">
                    ({request.satisfactionRating}/5)
                  </span>
                </div>
                {request.feedback && (
                  <p className="text-white/80 text-xs sm:text-sm mt-2 italic">
                    "{request.feedback}"
                  </p>
                )}
              </div>
            )}

            {canSubmitFeedback(request) && (
              <div className="pt-3 sm:pt-4 border-t border-white/20">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base h-10 sm:h-11"
                  onClick={() => setIsFeedbackModalOpen(true)}
                >
                  <Star className="w-4 h-4 mr-1 sm:mr-2" />
                  Gửi đánh giá
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog
        open={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
      >
        <DialogContent className="max-w-[92vw] sm:max-w-lg bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-semibold">
              Đánh giá yêu cầu hỗ trợ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label className="text-gray-600 font-medium mb-2 sm:mb-3 block text-sm sm:text-base">
                Mức độ hài lòng
              </Label>
              <div className="flex items-center gap-1 sm:gap-2">
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
                      className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${star <= feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-1 sm:ml-2 text-gray-700 text-sm sm:text-base">
                  {feedback.rating > 0
                    ? `${feedback.rating}/5`
                    : "Chọn số sao"}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-gray-600 font-medium mb-2 block text-sm sm:text-base">
                Nhận xét (tùy chọn)
              </Label>
              <Textarea
                placeholder="Chia sẻ ý kiến của bạn về cách chúng tôi đã xử lý yêu cầu này..."
                value={feedback.comment}
                onChange={(e) =>
                  setFeedback({ ...feedback, comment: e.target.value })
                }
                className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                maxLength={1000}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {feedback.comment.length}/1000 ký tự
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="flex-1 order-2 sm:order-1 h-10 sm:h-11 text-sm sm:text-base"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={feedback.rating === 0 || submittingFeedback}
                className="flex-1 order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 sm:h-11 text-sm sm:text-base"
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
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Ảnh đính kèm"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}


export default function SupportRequestDetail() {
  return (
    <LoginGuard>
      <SupportRequestDetailContent />
    </LoginGuard>
  );
}

