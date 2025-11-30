import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Plus,
  Eye,
  RefreshCcw,
  Loader2,
  Send,
  ShieldCheck,
  Users,
  Search,
  X,
  Upload,
  Image as ImageIcon,
  Filter,
  Calendar,
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    notificationType: "",
    priority: "",
    category: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Open view dialog
  const openViewDialog = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setIsViewDialogOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề thông báo.");
      return;
    }

    if (!formData.message.trim()) {
      setFormError("Vui lòng nhập nội dung thông báo.");
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
        message: formData.message.trim(), // Required field
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

  // Filter broadcasts
  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = broadcast.title?.toLowerCase().includes(searchLower);
      const messageMatch = broadcast.message
        ?.toLowerCase()
        .includes(searchLower);
      if (!titleMatch && !messageMatch) return false;
    }

    // Notification type filter
    if (
      filters.notificationType &&
      broadcast.notificationType !== filters.notificationType
    ) {
      return false;
    }

    // Priority filter
    if (filters.priority && broadcast.priority !== filters.priority) {
      return false;
    }

    // Category filter
    if (filters.category && broadcast.category !== filters.category) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const sentDate = new Date(broadcast.sentAt);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (sentDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (sentDate > toDate) return false;
      }
    }

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      notificationType: "",
      priority: "",
      category: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

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

            {/* Filters Section */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-emerald-600" />
                    Bộ lọc
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xóa bộ lọc
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-slate-600"
                    >
                      {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-3">
                      <label className="text-sm font-medium mb-2 block">
                        Tìm kiếm
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Notification Type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Loại thông báo
                      </label>
                      <Select
                        value={filters.notificationType || "all"}
                        onValueChange={(value) =>
                          setFilters({
                            ...filters,
                            notificationType: value === "all" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả loại</SelectItem>
                          {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Độ ưu tiên
                      </label>
                      <Select
                        value={filters.priority || "all"}
                        onValueChange={(value) =>
                          setFilters({
                            ...filters,
                            priority: value === "all" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả độ ưu tiên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Danh mục
                      </label>
                      <Select
                        value={filters.category || "all"}
                        onValueChange={(value) =>
                          setFilters({
                            ...filters,
                            category: value === "all" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả danh mục</SelectItem>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Từ ngày
                      </label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          setFilters({ ...filters, dateFrom: e.target.value })
                        }
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Đến ngày
                      </label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                          setFilters({ ...filters, dateTo: e.target.value })
                        }
                        min={filters.dateFrom || undefined}
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-sm text-slate-600 font-medium">
                        Đang lọc:
                      </span>
                      {filters.search && (
                        <Badge variant="secondary" className="gap-1">
                          Tìm kiếm: "{filters.search}"
                          <button
                            onClick={() =>
                              setFilters({ ...filters, search: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.notificationType && (
                        <Badge variant="secondary" className="gap-1">
                          Loại:{" "}
                          {
                            NOTIFICATION_TYPE_OPTIONS.find(
                              (opt) => opt.value === filters.notificationType
                            )?.label
                          }
                          <button
                            onClick={() =>
                              setFilters({ ...filters, notificationType: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.priority && (
                        <Badge variant="secondary" className="gap-1">
                          Ưu tiên:{" "}
                          {
                            PRIORITY_OPTIONS.find(
                              (opt) => opt.value === filters.priority
                            )?.label
                          }
                          <button
                            onClick={() =>
                              setFilters({ ...filters, priority: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.category && (
                        <Badge variant="secondary" className="gap-1">
                          Danh mục:{" "}
                          {
                            CATEGORY_OPTIONS.find(
                              (opt) => opt.value === filters.category
                            )?.label
                          }
                          <button
                            onClick={() =>
                              setFilters({ ...filters, category: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.dateFrom && (
                        <Badge variant="secondary" className="gap-1">
                          Từ:{" "}
                          {new Date(filters.dateFrom).toLocaleDateString(
                            "vi-VN"
                          )}
                          <button
                            onClick={() =>
                              setFilters({ ...filters, dateFrom: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.dateTo && (
                        <Badge variant="secondary" className="gap-1">
                          Đến:{" "}
                          {new Date(filters.dateTo).toLocaleDateString("vi-VN")}
                          <button
                            onClick={() =>
                              setFilters({ ...filters, dateTo: "" })
                            }
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Broadcasts Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách thông báo đã gửi
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    {hasActiveFilters ? (
                      <>
                        {filteredBroadcasts.length} / {broadcasts.length} thông
                        báo
                      </>
                    ) : (
                      <>{broadcasts.length} thông báo</>
                    )}
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
                          {filteredBroadcasts.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="py-8 text-center text-slate-500"
                              >
                                {hasActiveFilters ? (
                                  <>
                                    Không tìm thấy thông báo nào phù hợp với bộ
                                    lọc.
                                    <br />
                                    <Button
                                      variant="link"
                                      onClick={resetFilters}
                                      className="mt-2"
                                    >
                                      Xóa bộ lọc
                                    </Button>
                                  </>
                                ) : (
                                  "Chưa có thông báo nào được gửi. Tạo thông báo mới để bắt đầu."
                                )}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredBroadcasts.map((broadcast) => (
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
                                      onClick={() => openViewDialog(broadcast)}
                                      className="text-slate-600 hover:text-emerald-600"
                                      title="Xem chi tiết"
                                    >
                                      <Eye className="h-4 w-4" />
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
              <label className="text-sm font-medium">Nội dung *</label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Nhập nội dung thông báo"
                className="mt-1"
                rows={4}
                required
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

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Thông báo</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết của thông báo đã gửi
            </DialogDescription>
          </DialogHeader>

          {selectedBroadcast && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Tiêu đề
                </label>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedBroadcast.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Nội dung
                </label>
                <p className="mt-1 text-base text-slate-700 whitespace-pre-wrap">
                  {selectedBroadcast.message || "Không có nội dung"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Loại thông báo
                  </label>
                  <p className="mt-1 text-base text-slate-900">
                    {NOTIFICATION_TYPE_OPTIONS.find(
                      (opt) => opt.value === selectedBroadcast.notificationType
                    )?.label ||
                      selectedBroadcast.notificationType ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Độ ưu tiên
                  </label>
                  <p className="mt-1">
                    <Badge
                      variant={getPriorityBadgeVariant(
                        selectedBroadcast.priority
                      )}
                    >
                      {PRIORITY_OPTIONS.find(
                        (opt) => opt.value === selectedBroadcast.priority
                      )?.label ||
                        selectedBroadcast.priority ||
                        "N/A"}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Danh mục
                </label>
                <p className="mt-1 text-base text-slate-900">
                  {selectedBroadcast.category || "N/A"}
                </p>
              </div>

              {selectedBroadcast.actionUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    URL hành động
                  </label>
                  <p className="mt-1 text-base text-slate-900 break-all">
                    {selectedBroadcast.actionUrl}
                  </p>
                </div>
              )}

              {selectedBroadcast.actionLabel && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Nhãn hành động
                  </label>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedBroadcast.actionLabel}
                  </p>
                </div>
              )}

              {selectedBroadcast.imageUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Hình ảnh
                  </label>
                  <div className="mt-1">
                    <img
                      src={selectedBroadcast.imageUrl}
                      alt="Notification"
                      className="rounded-lg border border-slate-200 max-w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {selectedBroadcast.iconName && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Tên icon
                  </label>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedBroadcast.iconName}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Ngày gửi
                </label>
                <p className="mt-1 text-base text-slate-900">
                  {formatDate(selectedBroadcast.sentAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Số người nhận
                </label>
                <p className="mt-1">
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {selectedBroadcast.recipientCount} người
                  </Badge>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
