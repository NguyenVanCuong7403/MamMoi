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
  const datePart = timeStr.split(" ")[0]; // "2025-10-11"
  return datePart ? new Date(datePart + "T00:00:00") : null;
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

        if (dateFrom) {
          const fromDate = new Date(dateFrom + "T00:00:00");
          if (transactionDate < fromDate) return false;
        }

        if (dateTo) {
          const toDate = new Date(dateTo + "T23:59:59");
          if (transactionDate > toDate) return false;
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">
              Đang tải lịch sử giao dịch...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Mã đơn
                </TableHead>
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Thời gian
                </TableHead>
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Gói
                </TableHead>
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Số tiền/Phương thức
                </TableHead>
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Trạng thái
                </TableHead>
                <TableHead className="text-gray-900 font-semibold text-[clamp(14px,2vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-gray-600 text-lg"
                  >
                    Không tìm thấy giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((t, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900 text-[clamp(14px,1.8vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                      {t.id}
                    </TableCell>
                    <TableCell className="text-gray-900 text-[clamp(14px,1.8vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                      {t.time}
                    </TableCell>
                    <TableCell className="text-gray-900 text-[clamp(14px,1.8vw,18px)] py-6 px-6 mm-text-wrap-safe break-words">
                      {t.package}
                    </TableCell>
                    <TableCell className="py-6 px-6 min-w-0">
                      <div className="text-gray-900 font-medium text-[clamp(14px,1.8vw,18px)] mm-text-wrap-safe break-words">
                        {t.amount}
                      </div>
                      <div className="text-[clamp(13px,1.6vw,16px)] text-gray-600 mt-1 mm-text-wrap-safe break-words">
                        {t.method}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <span
                        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[clamp(12px,1.5vw,16px)] font-medium border mm-text-wrap-safe break-words ${t.statusColor}`}
                      >
                        <span className="w-3 h-3 rounded-full bg-current flex-shrink-0"></span>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 px-5 py-2.5 text-base font-medium"
                        onClick={() => openDetailModal(t)}
                      >
                        <Eye className="w-5 h-5" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8">
        <div className="text-lg text-white/60 font-medium">
          Hiển thị {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, filteredData.length)} /{" "}
          {filteredData.length} giao dịch
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white text-gray-900 disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="text-lg text-white/60 font-medium">
            Trang {page}/{currentPageCount}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              handlePageChange(Math.min(page + 1, currentPageCount))
            }
            disabled={page === currentPageCount}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white text-gray-900 disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-lg overflow-hidden shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Chi Tiết giao dịch
            </DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6 space-y-5 text-base">
            {selectedTransaction && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Mã đơn</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Mã giao dịch
                  </span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.txId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Gói</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.package}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Thời gian</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Phương thức</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.method}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Số tiền</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {selectedTransaction.amount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Trạng thái</span>
                  <span
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium border
                      ${selectedTransaction.statusColor}
                    `}
                  >
                    <span className="w-3 h-3 rounded-full bg-current"></span>
                    {selectedTransaction.status}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">
              * Nếu cần hỗ trợ hoá đơn hoặc hoàn tiền, vui lòng liên hệ support
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PaymentHistory;
