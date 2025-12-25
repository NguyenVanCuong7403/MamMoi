import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SupportRequestRepository from "@/API/repositories/SupportRequestRepository";
import { API_BASE } from "@/API/ApiClient";

export default function AdminSupportRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await SupportRequestRepository.getRequestById(Number(id));
        setRequest(data);
      } catch (err) {
        console.error("Error loading support request (admin):", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-xs sm:text-sm">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Quay lại
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">Chi tiết yêu cầu hỗ trợ</h1>
        </div>

        <div className="bg-white rounded-md p-4 sm:p-6 shadow">
          {!request && loading && <p className="text-sm">Đang tải...</p>}

          {request && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Mã ticket</Label>
                <div className="font-medium text-sm sm:text-base">
                  {request.ticketNumber || `#${request.requestId}`}
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Tiêu đề</Label>
                <div className="font-medium text-sm sm:text-base">{request.subject}</div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Trạng thái</Label>
                <div className="text-sm sm:text-base">{request.status}</div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Nội dung</Label>
                <div className="whitespace-pre-wrap bg-gray-50 p-2.5 sm:p-3 rounded mt-1.5 sm:mt-2 text-xs sm:text-sm">
                  {request.description}
                </div>
              </div>

              {(request.attachmentUrls || request.AttachmentUrls) && (
                <div>
                  <Label className="text-xs sm:text-sm">Ảnh chứng minh</Label>
                  <div className="mt-1.5 sm:mt-2">
                    <img
                      src={`${API_BASE}${request.attachmentUrls || request.AttachmentUrls}`}
                      alt="Attachment"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p className="text-gray-500 text-xs sm:text-sm" style={{ display: 'none' }}>
                      Không thể tải hình ảnh
                    </p>
                  </div>
                </div>
              )}

              {request.resolution && (
                <div>
                  <Label className="text-xs sm:text-sm">Giải pháp</Label>
                  <div className="whitespace-pre-wrap bg-green-50 p-2.5 sm:p-3 rounded mt-1.5 sm:mt-2 text-xs sm:text-sm">
                    {request.resolution}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">Ngày gửi</Label>
                  <div className="text-sm sm:text-base">{formatDate(request.requestDate)}</div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Ngày giải quyết</Label>
                  <div className="text-sm sm:text-base">
                    {request.resolvedAt ? formatDate(request.resolvedAt) : "-"}
                  </div>
                </div>
              </div>

              {request.satisfactionRating && (
                <div>
                  <Label className="text-xs sm:text-sm">Đánh giá (user)</Label>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${s <= request.satisfactionRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                    <span className="text-xs sm:text-sm">({request.satisfactionRating}/5)</span>
                  </div>
                  {request.feedback && (
                    <div className="mt-1.5 sm:mt-2 italic text-gray-700 text-xs sm:text-sm">
                      "{request.feedback}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

