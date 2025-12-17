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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <h1 className="text-2xl font-semibold">Chi tiết yêu cầu hỗ trợ</h1>
        </div>

        <div className="bg-white rounded-md p-6 shadow">
          {!request && loading && <p>Đang tải...</p>}

          {request && (
            <div className="space-y-4">
              <div>
                <Label>Mã ticket</Label>
                <div className="font-medium">
                  {request.ticketNumber || `#${request.requestId}`}
                </div>
              </div>

              <div>
                <Label>Tiêu đề</Label>
                <div className="font-medium">{request.subject}</div>
              </div>

              <div>
                <Label>Trạng thái</Label>
                <div>{request.status}</div>
              </div>

              <div>
                <Label>Nội dung</Label>
                <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-2">
                  {request.description}
                </div>
              </div>

              {(request.attachmentUrls || request.AttachmentUrls) && (
                <div>
                  <Label>Ảnh chứng minh</Label>
                  <div className="mt-2">
                    <img
                      src={`${API_BASE}${request.attachmentUrls || request.AttachmentUrls}`}
                      alt="Attachment"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p className="text-gray-500 text-sm" style={{ display: 'none' }}>
                      Không thể tải hình ảnh
                    </p>
                  </div>
                </div>
              )}

              {request.resolution && (
                <div>
                  <Label>Giải pháp</Label>
                  <div className="whitespace-pre-wrap bg-green-50 p-3 rounded mt-2">
                    {request.resolution}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày gửi</Label>
                  <div>{formatDate(request.requestDate)}</div>
                </div>
                <div>
                  <Label>Ngày giải quyết</Label>
                  <div>
                    {request.resolvedAt ? formatDate(request.resolvedAt) : "-"}
                  </div>
                </div>
              </div>

              {request.satisfactionRating && (
                <div>
                  <Label>Đánh giá (user)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${s <= request.satisfactionRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                    <span>({request.satisfactionRating}/5)</span>
                  </div>
                  {request.feedback && (
                    <div className="mt-2 italic text-gray-700">
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
