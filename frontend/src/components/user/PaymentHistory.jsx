import React, { useState, useMemo, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utility function to parse date from time string
const parseDateFromTime = (timeStr) => {
  if (!timeStr) return null;

  // Handle ISO format: "2025-11-27T22:34:29" or "2025-11-27T22:34:29.123Z"
  // Handle space-separated format: "2025-11-27 22:34:29"
  // Handle date-only format: "2025-11-27"
  let datePart = timeStr.trim();

  // If it contains 'T', split by 'T' and take the date part
  if (datePart.includes("T")) {
    datePart = datePart.split("T")[0];
  }
  // If it contains a space, split by space and take the date part
  else if (datePart.includes(" ")) {
    datePart = datePart.split(" ")[0];
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(datePart)) return null;

  // Create date object at midnight
  const date = new Date(datePart + "T00:00:00");

  // Validate the date is valid
  if (isNaN(date.getTime())) return null;

  return date;
};

function PaymentHistory({
  transactions = [],
  search = "",
  statusFilter = "Tất cả trạng thái",
  dateFrom = "",
  dateTo = "",
  onPageChange,
  loading = false,
}) {
  // Use transactions from API directly (no more demo data fallback)
  const data = transactions;

  // ── States ─────────────────────────────────────
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Pagination & Filters ───────────────────────
  const pageSize = 5;

  const filteredData = useMemo(() => {
    return data.filter((t) => {
      // Search filter - tìm theo nhiều trường
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        t.id.toLowerCase().includes(searchLower) ||
        t.package.toLowerCase().includes(searchLower) ||
        (t.txId && t.txId.toLowerCase().includes(searchLower)) ||
        t.method.toLowerCase().includes(searchLower) ||
        t.amount.toLowerCase().includes(searchLower) ||
        t.time.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      const matchesStatus =
        statusFilter === "Tất cả trạng thái" || t.status === statusFilter;
      if (!matchesStatus) return false;

      // Date filter
      if (dateFrom || dateTo) {
        const transactionDate = parseDateFromTime(t.time);
        if (!transactionDate) return false;

        // Normalize dates to midnight for accurate comparison
        const transactionDateOnly = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          transactionDate.getDate()
        );

        if (dateFrom) {
          const fromDate = new Date(dateFrom + "T00:00:00");
          const fromDateOnly = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate()
          );
          if (transactionDateOnly < fromDateOnly) return false;
        }

        if (dateTo) {
          const toDate = new Date(dateTo + "T23:59:59");
          const toDateOnly = new Date(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate()
          );
          if (transactionDateOnly > toDateOnly) return false;
        }
      }

      return true;
    });
  }, [data, search, statusFilter, dateFrom, dateTo]);

  const currentPageCount = Math.ceil(filteredData.length / pageSize);
  const currentPageData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ── Reset page when filtered data changes ─────────────
  useEffect(() => {
    if (page > currentPageCount && currentPageCount > 0) {
      setPage(currentPageCount);
    } else if (currentPageCount === 0) {
      setPage(1);
    }
  }, [filteredData.length, currentPageCount, page]);

  // ── Handle page change ─────────────────────────
  const handlePageChange = (newPage) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  // ── Open Modal ─────────────────────────────────
  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // ── Render ─────────────────────────────────────

  // Show loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-[clamp(14px,2vw,18px)] text-center">
              Đang tải lịch sử giao dịch...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Landscape: Table View */}
      <div className="hidden md:block w-full">
        <div className="w-full overflow-x-auto -mx-2 px-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    STT
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    Gói
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    Số tiền/Phương thức
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold text-[clamp(12px,1.5vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 md:py-16 text-gray-600 text-[clamp(14px,2vw,18px)]"
                    >
                      Không tìm thấy giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((t, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="text-gray-900 text-[clamp(12px,1.4vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 break-words">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="text-gray-900 text-[clamp(12px,1.4vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 break-words whitespace-nowrap">
                        {t.time.replace("T", " ")}
                      </TableCell>
                      <TableCell className="text-gray-900 text-[clamp(12px,1.4vw,16px)] py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 break-words">
                        {t.package}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6 min-w-0">
                        <div className="text-gray-900 font-medium text-[clamp(12px,1.4vw,16px)] break-words">
                          {t.amount}
                        </div>
                        <div className="text-[clamp(11px,1.2vw,14px)] text-gray-600 mt-1 break-words">
                          {t.method}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2.5 rounded-full text-[clamp(11px,1.2vw,14px)] font-medium border ${t.statusColor}`}
                        >
                          <span className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full bg-current flex-shrink-0"></span>
                          <span className="break-words">{t.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 lg:py-6 px-3 md:px-4 lg:px-6">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1.5 md:gap-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-[clamp(12px,1.3vw,15px)] font-medium whitespace-nowrap"
                          onClick={() => openDetailModal(t)}
                        >
                          <Eye className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span className="hidden sm:inline">Chi tiết</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Portrait: Card View */}
      <div className="block md:hidden w-full space-y-4">
        {currentPageData.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center py-12 text-gray-600 text-lg">
              Không tìm thấy giao dịch nào
            </div>
          </div>
        ) : (
          currentPageData.map((t, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">STT</div>
                  <div className="text-sm font-semibold text-gray-900 break-words">
                    {(page - 1) * pageSize + index + 1}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 px-3 py-2 text-xs font-medium flex-shrink-0"
                  onClick={() => openDetailModal(t)}
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Thời gian</div>
                  <div className="text-sm text-gray-900 break-words">
                    {t.time.replace("T", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Gói</div>
                  <div className="text-sm text-gray-900 break-words">
                    {t.package}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Số tiền</div>
                  <div className="text-sm font-medium text-gray-900 break-words">
                    {t.amount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Phương thức</div>
                  <div className="text-sm text-gray-600 break-words">
                    {t.method}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Trạng thái</div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${t.statusColor}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-current flex-shrink-0"></span>
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 md:mt-8">
        <div className="text-[clamp(13px,1.8vw,16px)] text-white/60 font-medium text-center sm:text-left">
          Hiển thị {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, filteredData.length)} /{" "}
          {filteredData.length} giao dịch
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="p-2 md:p-3 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white text-gray-900 disabled:opacity-50 min-w-[44px] min-h-[44px]"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <span className="text-[clamp(13px,1.8vw,16px)] text-white/60 font-medium px-2 md:px-4 whitespace-nowrap">
            Trang {page}/{currentPageCount}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              handlePageChange(Math.min(page + 1, currentPageCount))
            }
            disabled={page === currentPageCount}
            className="p-2 md:p-3 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white text-gray-900 disabled:opacity-50 min-w-[44px] min-h-[44px]"
            aria-label="Trang sau"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-md md:max-w-lg bg-white rounded-xl sm:rounded-lg overflow-hidden shadow-lg mx-2 sm:mx-4 p-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              Chi tiết giao dịch
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedTransaction && (
              <>
                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Mã đơn
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-right break-all">
                    {selectedTransaction.id}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Mã giao dịch
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-right break-all">
                    {selectedTransaction.txId || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Gói
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-right">
                    {selectedTransaction.package}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Thời gian
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-right">
                    {selectedTransaction.time?.replace("T", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Phương thức
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-right">
                    {selectedTransaction.method}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Số tiền
                  </span>
                  <span className="font-bold text-emerald-600 text-sm sm:text-base text-right">
                    {selectedTransaction.amount}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-2">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium shrink-0">
                    Trạng thái
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border ${selectedTransaction.statusColor}`}
                  >
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current flex-shrink-0"></span>
                    {selectedTransaction.status}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500">
              * Nếu cần hỗ trợ hoá đơn hoặc hoàn tiền, vui lòng liên hệ support
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PaymentHistory;
