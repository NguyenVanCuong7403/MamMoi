import React, { useState } from "react";
import { Search, Download, Eye, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function PaymentHistory(props) {
  const defaultTransactions = [
    {
      id: "SUB-STARTER-58723",
      time: "2025-10-11 09:35",
      package: "Starter",
      amount: "490,000 đ",
      method: "QR (VNPay)",
      status: "Thành công",
      statusColor: "bg-green-50 text-green-700 border-green-200",
      txId: "TX9X2H1",
    },
    {
      id: "SUB-PRO-20144",
      time: "2025-10-08 14:12",
      package: "Pro",
      amount: "990,000 đ",
      method: "Ghi nợ (VNPay)",
      status: "Đang xử lý",
      statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
      txId: "PRX1234",
    },
    {
      id: "SUB-FARM-11102",
      time: "2025-09-28 10:01",
      package: "Farmer",
      amount: "1,990,000 đ",
      method: "Bank Transfer",
      status: "Hoàn tiền",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      txId: "FM9876",
    },
    {
      id: "SUB-STARTER-11092",
      time: "2025-09-20 20:51",
      package: "Starter",
      amount: "490,000 đ",
      method: "QR (VNPay)",
      status: "Thất bại",
      statusColor: "bg-red-50 text-red-700 border-red-200",
      txId: "STFAIL01",
    },
    {
      id: "SUB-STARTER-11011",
      time: "2025-09-10 07:25",
      package: "Starter",
      amount: "490,000 đ",
      method: "Card",
      status: "Thành công",
      statusColor: "bg-green-50 text-green-700 border-green-200",
      txId: "ST11011",
    },
  ];

  const transactions = props.transactions || defaultTransactions;

  // ── States ─────────────────────────────────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Pagination & Filters ───────────────────────
  const pageSize = 5;
  const pageCount = Math.ceil(transactions.length / pageSize);
  const statusOptions = ["Tất cả trạng thái", ...new Set(transactions.map((t) => t.status))];

  const filteredData = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.package.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Tất cả trạng thái" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentPageData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const currentPageCount = Math.ceil(filteredData.length / pageSize);

  // ── CSV Export ─────────────────────────────────
  const exportCSV = () => {
    const headers = ["Mã đơn", "Thời gian", "Gói", "Số tiền", "Phương thức", "Trạng thái"];
    const rows = filteredData.map((t) => [
      t.id,
      t.time,
      t.package,
      t.amount.toString().replace(/,/g, "."),
      t.method,
      t.status,
    ]);

    let csvContent =
      "\uFEFF" +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Open Modal ─────────────────────────────────
  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // ── Render ─────────────────────────────────────
  return (
    <div data-fluid-page className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-emerald-800 h-28 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topographic" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <path d="M0,30 Q20,10 40,30 T80,30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <path d="M20,70 Q40,50 60,70 T100,70" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topographic)"/>
        </svg>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-white text-3xl font-bold">Lịch sử giao dịch</h1>
        </div>
      </div>

      <div data-fluid-shell className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm mã đơn, gói, TXID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                {statusOptions.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              onClick={() => { setSearch(""); setStatusFilter("Tất cả trạng thái"); setPage(1); }}
            >
              Reset
            </Button>

            <Button onClick={exportCSV} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
              <Download className="w-4 h-4" /> Xuất CSV
            </Button>
          </div>

          {/* Table */}
          <h2 className="text-xl font-semibold mb-4">Giao dịch gần đây</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Số tiền/Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.map((t, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.time}</TableCell>
                    <TableCell>{t.package}</TableCell>
                    <TableCell>
                      <div>{t.amount}</div>
                      <div className="text-xs text-gray-500">{t.method}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${t.statusColor}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 px-3 py-1.5"
                        onClick={() => openDetailModal(t)}
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredData.length)} / {filteredData.length} giao dịch
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-700">Trang {page}/{currentPageCount}</span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(page + 1, currentPageCount))}
                disabled={page === currentPageCount}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
  <DialogContent
    className="max-w-md bg-white rounded overflow-hidden shadow-lg" // rounded corners
  >

    {/* ---- Header ---- */}
    <DialogTitle >Chi Tiết giao dịch</DialogTitle>

    {/* ---- Body ---- */}
    <div className="px-3 py-1 space-y-1 text-sm">
      {selectedTransaction && (
        <>
          <div className="flex justify-between">
            <span className="text-gray-600">Mã đơn</span>
            <span className="font-medium text-gray-900">{selectedTransaction.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Mã giao dịch</span>
            <span className="font-medium text-gray-900">{selectedTransaction.txId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Gói</span>
            <span className="font-medium text-gray-900">{selectedTransaction.package}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian</span>
            <span className="font-medium text-gray-900">{selectedTransaction.time}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Phương thức</span>
            <span className="font-medium text-gray-900">{selectedTransaction.method}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Số tiền</span>
            <span className="font-medium text-gray-900">{selectedTransaction.amount}</span>
          </div>

          {/* ---- Status ---- */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Trạng thái</span>
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                ${selectedTransaction.statusColor}
              `}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {selectedTransaction.status}
            </span>
          </div>
        </>
      )}
    </div>

    {/* ---- Footer Note ---- */}
    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-center">
      <p className="text-[10px] text-gray-500">
        * Nếu cần hỗ trợ hoá đơn hoặc hoàn tiền, vui lòng liên hệ support
      </p>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}

export default PaymentHistory;