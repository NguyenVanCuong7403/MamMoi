import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Plus,
  Edit,
  Trash,
  RefreshCcw,
  Loader2,
  Send,
  ShieldCheck,
  Users,
  Search,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NotificationRepository from "@/API/repositories/NotificationRepository";
import AdminUserRepository from "@/API/repositories/AdminUserRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Thấp" },
  { value: "Normal", label: "Bình thường" },
  { value: "Medium", label: "Trung bình" },
  { value: "High", label: "Cao" },
  { value: "Critical", label: "Khẩn cấp" },
];

const NOTIFICATION_TYPE_OPTIONS = [
  { value: "Broadcast", label: "Thông báo chung" },
  { value: "Promotion", label: "Khuyến mãi" },
  { value: "System", label: "Hệ thống" },
  { value: "Announcement", label: "Thông báo" },
];

const CATEGORY_OPTIONS = [
  { value: "General", label: "Chung" },
  { value: "Promotion", label: "Khuyến mãi" },
  { value: "Update", label: "Cập nhật" },
  { value: "Maintenance", label: "Bảo trì" },
];

// Format date helper
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationManagement() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserSelectDialogOpen, setIsUserSelectDialogOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);

  // Recipient mode: "all" or "selected"
  const [recipientMode, setRecipientMode] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // User selection dialog states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const PAGE_SIZE = 50;

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notificationType: "Broadcast",
    priority: "Normal",
    category: "General",
    actionUrl: "",
    actionLabel: "",
    imageUrl: "",
    iconName: "",
    expiresAt: "",
  });

  const [actionNotice, setActionNotice] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      notificationType: "Broadcast",
      priority: "Normal",
      category: "General",
      actionUrl: "",
      actionLabel: "",
      imageUrl: "",
      iconName: "",
      expiresAt: "",
    });
    setFormError("");
    setRecipientMode("all");
    setSelectedUserIds([]);
  };

  // Fetch broadcasts from API
  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await NotificationRepository.getBroadcastNotifications();
      console.log("Broadcast notifications response:", response);

      if (response.success) {
        const broadcastData = Array.isArray(response.data) ? response.data : [];
        console.log("Setting broadcasts:", broadcastData);
        setBroadcasts(broadcastData);
      } else {
        setError(
          response.message || "Có lỗi xảy ra khi tải danh sách thông báo"
        );
      }
    } catch (err) {
      console.error("Error fetching broadcast notifications:", err);
      const errorMsg =
        err.message || "Có lỗi xảy ra khi tải danh sách thông báo";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  // Fetch users for selection
  const fetchUsers = async (page = 1, searchTerm = "") => {
    try {
      setUsersLoading(true);
      const response = await AdminUserRepository.getAllUsers(
        page,
        PAGE_SIZE,
        searchTerm || null,
        null,
        true // Only active users
      );

      if (response.success) {
        const transformedUsers = response.data.map((user) => ({
          userId: user.userId,
          name: user.fullName,
          email: user.email,
          phone: user.phone || "",
          role: user.roleName,
        }));

        if (page === 1) {
          setUsers(transformedUsers);
        } else {
          setUsers((prev) => [...prev, ...transformedUsers]);
        }

        setUserTotalCount(response.pagination?.totalCount || 0);
        setUserTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load users when user select dialog opens
  useEffect(() => {
    if (isUserSelectDialogOpen) {
      fetchUsers(1, userSearchTerm);
    }
  }, [isUserSelectDialogOpen]);

  // Handle user search
  const handleUserSearch = (searchTerm) => {
    setUserSearchTerm(searchTerm);
    setUserPage(1);
    fetchUsers(1, searchTerm);
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all visible users
  const selectAllVisibleUsers = () => {
    const visibleUserIds = users.map((u) => u.userId);
    setSelectedUserIds((prev) => {
      const newIds = [...prev];
      visibleUserIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  };

  // Deselect all visible users
  const deselectAllVisibleUsers = () => {
    const visibleUserIds = users.map((u) => u.userId);
    setSelectedUserIds((prev) =>
      prev.filter((id) => !visibleUserIds.includes(id))
    );
  };

  // Check if all visible users are selected
  const areAllVisibleUsersSelected = () => {
    if (users.length === 0) return false;
    return users.every((u) => selectedUserIds.includes(u.userId));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Kích thước file không được vượt quá 5MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setFormError("");

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: previewUrl });

      // Upload to server
      const response = await NotificationRepository.uploadNotificationImage(
        file
      );

      if (response.success && response.url) {
        // Update with server URL
        setFormData({ ...formData, imageUrl: response.url });
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
      } else {
        setFormError("Upload hình ảnh thất bại. Vui lòng thử lại.");
        // Keep preview URL as fallback
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setFormError("Có lỗi xảy ra khi upload hình ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image click to trigger file input
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setFormData({
      title: broadcast.title || "",
      message: broadcast.message || "",
      notificationType: broadcast.notificationType || "Broadcast",
      priority: broadcast.priority || "Normal",
      category: broadcast.category || "General",
      actionUrl: broadcast.actionUrl || "",
      actionLabel: broadcast.actionLabel || "",
      imageUrl: broadcast.imageUrl || "",
      iconName: broadcast.iconName || "",
      expiresAt: broadcast.expiresAt
        ? new Date(broadcast.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setIsDeleteDialogOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề thông báo.");
      return;
    }

    if (recipientMode === "selected" && selectedUserIds.length === 0) {
      setFormError("Vui lòng chọn ít nhất một người dùng.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim() || null,
        notificationType: formData.notificationType || "Broadcast",
        priority: formData.priority || "Normal",
        category: formData.category || null,
        actionUrl: formData.actionUrl.trim() || null,
        actionLabel: formData.actionLabel.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        iconName: formData.iconName.trim() || null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
        // Add userIds if sending to selected users
        ...(recipientMode === "selected" && { userIds: selectedUserIds }),
      };

      let response;
      if (recipientMode === "all") {
        // Send to all users using broadcast endpoint
        response = await NotificationRepository.broadcastNotification(payload);
      } else {
        // Send to selected users
        // Note: Backend needs to support userIds in the payload or a new endpoint
        // For now, we'll try to use the broadcast endpoint with userIds
        // If backend doesn't support it, you'll need to add a new endpoint
        response = await NotificationRepository.sendNotificationToUsers({
          ...payload,
          userIds: selectedUserIds,
        });
      }

      if (response.success) {
        setActionNotice({
          message: `Đã gửi thông báo đến ${
            response.data?.recipientsCount || selectedUserIds.length || 0
          } người dùng!`,
          tone: "success",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        await fetchBroadcasts();
      } else {
        setFormError(response.message || "Có lỗi xảy ra khi gửi thông báo");
      }
    } catch (err) {
      console.error("Error creating broadcast notification:", err);
      setFormError(err.message || "Có lỗi xảy ra khi gửi thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedBroadcast) return;

    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề thông báo.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {};
      if (formData.title.trim()) payload.title = formData.title.trim();
      if (formData.message !== undefined)
        payload.message = formData.message.trim() || null;
      if (formData.notificationType)
        payload.notificationType = formData.notificationType;
      if (formData.priority) payload.priority = formData.priority;
      if (formData.category !== undefined)
        payload.category = formData.category || null;
      if (formData.actionUrl !== undefined)
        payload.actionUrl = formData.actionUrl.trim() || null;
      if (formData.actionLabel !== undefined)
        payload.actionLabel = formData.actionLabel.trim() || null;
      if (formData.imageUrl !== undefined)
        payload.imageUrl = formData.imageUrl.trim() || null;
      if (formData.iconName !== undefined)
        payload.iconName = formData.iconName.trim() || null;
      if (formData.expiresAt !== undefined) {
        payload.expiresAt = formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null;
      }

      const response = await NotificationRepository.updateBroadcastNotification(
        selectedBroadcast.groupId,
        payload
      );

      if (response.success) {
        setActionNotice({
          message: "Đã cập nhật thông báo thành công!",
          tone: "success",
        });
        setIsEditDialogOpen(false);
        resetForm();
        await fetchBroadcasts();
      } else {
        setFormError(
          response.message || "Có lỗi xảy ra khi cập nhật thông báo"
        );
      }
    } catch (err) {
      console.error("Error updating broadcast notification:", err);
      setFormError(err.message || "Có lỗi xảy ra khi cập nhật thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBroadcast) return;

    try {
      setSubmitting(true);
      const response = await NotificationRepository.deleteBroadcastNotification(
        selectedBroadcast.groupId
      );

      if (response.success) {
        setActionNotice({
          message: "Đã xóa thông báo thành công!",
          tone: "success",
        });
        setIsDeleteDialogOpen(false);
        setSelectedBroadcast(null);
        await fetchBroadcasts();
      } else {
        setActionNotice({
          message: response.message || "Có lỗi xảy ra khi xóa thông báo",
          tone: "error",
        });
      }
    } catch (err) {
      console.error("Error deleting broadcast notification:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi xóa thông báo",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[
          BACKGROUND_PALETTE.leaf,
          BACKGROUND_PALETTE.ivory,
          BACKGROUND_PALETTE.accent,
        ]}
        density={28}
      />
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị hệ thống
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý thông báo
                </h1>
                <p className="text-emerald-100/80">
                  Tạo và quản lý thông báo gửi đến tất cả người dùng trong hệ
                  thống.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={fetchBroadcasts}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                  />
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={openCreateDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo thông báo
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
                {error}
              </div>
            )}

            {actionNotice && (
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                  actionNotice.tone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                )}
              >
                {actionNotice.message}
              </div>
            )}

            {/* Broadcasts Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách thông báo đã gửi
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    {broadcasts.length} thông báo
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && broadcasts.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <span className="ml-3 text-slate-600">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <Table>
                        <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                          <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Ngày gửi</TableHead>
                            <TableHead>Số người nhận</TableHead>
                            <TableHead className="text-right">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {broadcasts.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="py-8 text-center text-slate-500"
                              >
                                Chưa có thông báo nào được gửi. Tạo thông báo
                                mới để bắt đầu.
                              </TableCell>
                            </TableRow>
                          ) : (
                            broadcasts.map((broadcast) => (
                              <TableRow
                                key={broadcast.groupId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-medium text-slate-800">
                                  {broadcast.title}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {formatDate(broadcast.sentAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {broadcast.recipientCount} người
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(broadcast)}
                                      className="text-slate-600 hover:text-emerald-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openDeleteDialog(broadcast)
                                      }
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Thông báo Mới</DialogTitle>
            <DialogDescription>
              Tạo thông báo để gửi đến người dùng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Recipient Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Người nhận *
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="recipient-all"
                    name="recipient-mode"
                    value="all"
                    checked={recipientMode === "all"}
                    onChange={(e) => setRecipientMode(e.target.value)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="recipient-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Gửi cho tất cả người dùng
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="recipient-selected"
                    name="recipient-mode"
                    value="selected"
                    checked={recipientMode === "selected"}
                    onChange={(e) => setRecipientMode(e.target.value)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="recipient-selected"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Chọn người dùng cụ thể
                  </label>
                </div>
                {recipientMode === "selected" && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUserSelectDialogOpen(true)}
                      className="w-full"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {selectedUserIds.length > 0
                        ? `Đã chọn ${selectedUserIds.length} người dùng`
                        : "Chọn người dùng"}
                    </Button>
                    {selectedUserIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {users
                          .filter((u) => selectedUserIds.includes(u.userId))
                          .slice(0, 5)
                          .map((user) => (
                            <Badge
                              key={user.userId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {user.name}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedUserIds((prev) =>
                                    prev.filter((id) => id !== user.userId)
                                  )
                                }
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        {selectedUserIds.length > 5 && (
                          <Badge variant="secondary">
                            +{selectedUserIds.length - 5} khác
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề thông báo"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nội dung</label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Nhập nội dung thông báo"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Loại thông báo</label>
                <Select
                  value={formData.notificationType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, notificationType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Độ ưu tiên</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                URL hành động (tùy chọn)
              </label>
              <Input
                value={formData.actionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, actionUrl: e.target.value })
                }
                placeholder="/promotions/discount"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Nhãn hành động (tùy chọn)
              </label>
              <Input
                value={formData.actionLabel}
                onChange={(e) =>
                  setFormData({ ...formData, actionLabel: e.target.value })
                }
                placeholder="Xem ngay"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Hình ảnh (tùy chọn)
                </label>
                <div className="mt-1 space-y-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {formData.imageUrl ? (
                    <div className="relative group">
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={handleImageClick}
                      className={cn(
                        "rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors flex flex-col items-center justify-center h-40",
                        uploadingImage && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                          <span className="text-sm text-slate-500">
                            Đang upload...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">
                            Click để chọn ảnh
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            PNG, JPG, GIF (Tối đa 5MB)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="Hoặc nhập URL hình ảnh"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tên icon (tùy chọn)
                </label>
                <Input
                  value={formData.iconName}
                  onChange={(e) =>
                    setFormData({ ...formData, iconName: e.target.value })
                  }
                  placeholder="bell, gift, etc."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Ngày hết hạn (tùy chọn)
              </label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi thông báo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Thông báo</DialogTitle>
            <DialogDescription>
              Cập nhật thông báo đã gửi (sẽ cập nhật cho tất cả người nhận)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề thông báo"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nội dung</label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Nhập nội dung thông báo"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Loại thông báo</label>
                <Select
                  value={formData.notificationType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, notificationType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Độ ưu tiên</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                URL hành động (tùy chọn)
              </label>
              <Input
                value={formData.actionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, actionUrl: e.target.value })
                }
                placeholder="/promotions/discount"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Nhãn hành động (tùy chọn)
              </label>
              <Input
                value={formData.actionLabel}
                onChange={(e) =>
                  setFormData({ ...formData, actionLabel: e.target.value })
                }
                placeholder="Xem ngay"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Hình ảnh (tùy chọn)
                </label>
                <div className="mt-1 space-y-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {formData.imageUrl ? (
                    <div className="relative group">
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={handleImageClick}
                      className={cn(
                        "rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors flex flex-col items-center justify-center h-40",
                        uploadingImage && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                          <span className="text-sm text-slate-500">
                            Đang upload...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">
                            Click để chọn ảnh
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            PNG, JPG, GIF (Tối đa 5MB)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="Hoặc nhập URL hình ảnh"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tên icon (tùy chọn)
                </label>
                <Input
                  value={formData.iconName}
                  onChange={(e) =>
                    setFormData({ ...formData, iconName: e.target.value })
                  }
                  placeholder="bell, gift, etc."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Ngày hết hạn (tùy chọn)
              </label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEdit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo "{selectedBroadcast?.title}
              "? Hành động này không thể hoàn tác và sẽ xóa thông báo khỏi tất
              cả người nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Selection Dialog */}
      <Dialog
        open={isUserSelectDialogOpen}
        onOpenChange={setIsUserSelectDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn người dùng</DialogTitle>
            <DialogDescription>
              Chọn các người dùng sẽ nhận thông báo này
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                value={userSearchTerm}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={areAllVisibleUsersSelected()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAllVisibleUsers();
                    } else {
                      deselectAllVisibleUsers();
                    }
                  }}
                />
                <label className="text-sm font-medium cursor-pointer">
                  Chọn tất cả
                </label>
              </div>
              <Badge variant="secondary">
                Đã chọn: {selectedUserIds.length} người dùng
              </Badge>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              {usersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span className="ml-2 text-slate-600">Đang tải...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  Không tìm thấy người dùng nào
                </div>
              ) : (
                <div className="divide-y">
                  {users.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleUserSelection(user.userId)}
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(user.userId)}
                        onCheckedChange={() => toggleUserSelection(user.userId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-slate-400">{user.phone}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Trang {userPage} / {userTotalPages} ({userTotalCount} người
                  dùng)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (userPage > 1) {
                        const newPage = userPage - 1;
                        setUserPage(newPage);
                        fetchUsers(newPage, userSearchTerm);
                      }
                    }}
                    disabled={userPage === 1 || usersLoading}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (userPage < userTotalPages) {
                        const newPage = userPage + 1;
                        setUserPage(newPage);
                        fetchUsers(newPage, userSearchTerm);
                      }
                    }}
                    disabled={userPage === userTotalPages || usersLoading}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserSelectDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={() => setIsUserSelectDialogOpen(false)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Xác nhận ({selectedUserIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
