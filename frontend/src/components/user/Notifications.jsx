import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import NotificationRepository from "@/API/repositories/NotificationRepository";
import { getNotificationRoute } from "@/lib/notificationRoutes";
import { useAuth } from "@/API/context/AuthContext";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

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

// Get priority badge variant
function getPriorityBadgeVariant(priority) {
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
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReadFilter, setIsReadFilter] = useState(null);
  const [notificationTypeFilter, setNotificationTypeFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await NotificationRepository.getUserNotifications(
        page,
        PAGE_SIZE,
        isReadFilter,
        notificationTypeFilter
      );

      if (response.success) {
        setNotifications(response.data || []);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError(response.message || "Có lỗi xảy ra khi tải thông báo");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      const errorMsg = err.message || "Có lỗi xảy ra khi tải thông báo";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationRepository.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page, isReadFilter, notificationTypeFilter]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(true);
      const response = await NotificationRepository.markNotificationsAsRead([
        notificationId,
      ]);

      if (response.success) {
        setActionNotice({
          message: "Đã đánh dấu đã đọc",
          tone: "success",
        });
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra",
        tone: "error",
      });
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAsRead(true);
      const response =
        await NotificationRepository.markAllNotificationsAsRead();

      if (response.success) {
        setActionNotice({
          message: "Đã đánh dấu tất cả đã đọc",
          tone: "success",
        });
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra",
        tone: "error",
      });
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Filter notifications by search term
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      notification.title?.toLowerCase().includes(search) ||
      notification.message?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen">
      <main className="mm-fluid-shell px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-[clamp(20px,3vw,24px)] font-semibold text-slate-900 mm-text-wrap-safe break-words">
                Thông báo của tôi
              </h2>
              <p className="mt-1 text-[clamp(12px,1.5vw,14px)] text-slate-600 mm-text-wrap-safe break-words">
                Quản lý và xem tất cả thông báo bạn đã nhận
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge className="bg-emerald-600 text-white">
                  {unreadCount} chưa đọc
                </Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAsRead}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Button
                variant="outline"
                onClick={fetchNotifications}
                disabled={loading}
              >
                <RefreshCcw
                  className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Action Notice */}
          {actionNotice && (
            <div
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-semibold",
                actionNotice.tone === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              )}
            >
              {actionNotice.message}
            </div>
          )}

          {/* Filters */}
          <Card className="bg-white/95 shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm thông báo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <Select
                    value={
                      isReadFilter === null
                        ? "all"
                        : isReadFilter
                        ? "read"
                        : "unread"
                    }
                    onValueChange={(value) => {
                      setIsReadFilter(
                        value === "all" ? null : value === "read" ? true : false
                      );
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="unread">Chưa đọc</SelectItem>
                      <SelectItem value="read">Đã đọc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-3">
                  <Select
                    value={notificationTypeFilter || "all"}
                    onValueChange={(value) => {
                      setNotificationTypeFilter(value === "all" ? null : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Loại thông báo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="SupportRequest">Hỗ trợ</SelectItem>
                      <SelectItem value="Broadcast">Thông báo chung</SelectItem>
                      <SelectItem value="TaskExpiration">Nhiệm vụ</SelectItem>
                      <SelectItem value="Promotion">Khuyến mãi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Danh sách thông báo ({totalCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="ml-3 text-slate-600">
                    Đang tải thông báo...
                  </span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  {searchTerm
                    ? "Không tìm thấy thông báo nào"
                    : "Chưa có thông báo nào"}
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Thông báo</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Độ ưu tiên</TableHead>
                          <TableHead>Ngày gửi</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotifications.map((notification) => {
                          const handleNotificationClick = () => {
                            const route = getNotificationRoute(
                              notification,
                              user
                            );
                            if (route) {
                              navigate(route);
                            }
                          };

                          return (
                            <TableRow
                              key={notification.notificationId}
                              className={cn(
                                "transition cursor-pointer",
                                !notification.isRead &&
                                  "bg-blue-50/50 font-semibold"
                              )}
                              onClick={handleNotificationClick}
                            >
                              <TableCell>
                                <div className="space-y-1 min-w-0">
                                  <div className="font-medium text-slate-900 mm-text-wrap-safe break-words">
                                    {notification.title}
                                  </div>
                                  {notification.message && (
                                    <div className="text-sm text-slate-600 line-clamp-2 mm-text-wrap-safe break-words">
                                      {notification.message}
                                    </div>
                                  )}
                                  <div className="text-sm text-emerald-600 hover:underline mm-text-wrap-safe break-words">
                                    {notification.actionLabel || "Xem chi tiết"}{" "}
                                    →
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {notification.notificationType || "General"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getPriorityBadgeVariant(
                                    notification.priority
                                  )}
                                >
                                  {notification.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {formatDate(notification.sentAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(
                                        notification.notificationId
                                      );
                                    }}
                                    disabled={markingAsRead}
                                    className="text-emerald-600 hover:text-emerald-700"
                                  >
                                    <Check className="mr-1 h-4 w-4" />
                                    Đánh dấu đã đọc
                                  </Button>
                                )}
                                {notification.isRead && (
                                  <span className="text-sm text-slate-400">
                                    Đã đọc
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              className={cn(
                                page === 1 && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                              className={cn(
                                page === totalPages &&
                                  "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
