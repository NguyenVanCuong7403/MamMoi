import React from 'react';
import { Check, Printer, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InvoiceSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công
            </h1>
            <p className="text-gray-600">
              Hóa đơn của bạn đã được tạo và gửi về email.
            </p>
          </div>

          {/* Invoice Details */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Hóa đơn
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Thông tin khách hàng
                  </p>
                  <p className="text-sm text-gray-600">Quân Nguyễn</p>
                  <p className="text-sm text-gray-600">NHQ2374@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-4">
                  02:57:11 11/10/2025
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Đơn vị phát hành
                  </p>
                  <p className="text-sm text-gray-600">Công ty TNHH Mầm Mới</p>
                  <p className="text-sm text-gray-600">MST: 0312345678</p>
                  <p className="text-sm text-gray-600">
                    177 West Street, Linh Đàm, Hà Nội
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Mã đơn:</p>
                <p className="text-sm font-medium text-gray-900">
                  SUB-STARTER-001
                </p>
                <p className="text-xs text-gray-500">
                  Hình thức: Chuyển khoản QR (VNPay)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã giao dịch:</p>
                <p className="text-sm font-medium text-gray-900">
                  Tv-DEMO123
                </p>
                <p className="text-xs text-gray-500">
                  GÓI: Starter – Chăm sóc cây ăn quả
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-700 pb-2 border-b">
                <span>Mô tả</span>
                <span>Thành tiền</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Starter – Chăm sóc cây ăn quả – Kỳ hạn 1 tháng
                  </span>
                  <span className="text-gray-900 font-medium">490.000 ₫</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí QR</span>
                  <span className="text-gray-900 font-medium">0 ₫</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span className="text-green-600">TỔNG CỘNG</span>
                <span className="text-green-600">490.000 ₫</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              * Bản sao hóa đơn đã được gửi tới NHQ2374@gmail.com.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                In
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Tải PDF (demo)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}