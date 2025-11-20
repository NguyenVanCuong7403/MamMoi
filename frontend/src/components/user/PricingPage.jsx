import React, { useState } from 'react';
import { Check, Bell, Calendar, Cloud, Book, ChevronDown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const plans = [
    {
      name: 'Starter',
      duration: 'Tiết kiệm 2 tháng',
      price: '490.000',
      popular: false,
      features: [
        'Cảnh báo sâu bệnh cơ bản',
        'Lịch tưới & bón mầu',
        'Nhật ký vườn',
        'Hỗ trợ qua email'
      ],
      buttonText: 'Đặt đầu',
      buttonVariant: 'default'
    },
    {
      name: 'Pro',
      duration: 'Tiết kiệm 2 tháng',
      price: '990.000',
      popular: true,
      features: [
        'Cảnh báo sâu bệnh nâng cao',
        'Lịch tưới & bón theo giống',
        'Dòng bộ thời tiết địa phương',
        'Cảnh báo thời tiết địa phương',
        'Xuất báo cáo PDF'
      ],
      buttonText: 'Đăng ký Pro',
      buttonVariant: 'default'
    },
    {
      name: 'Farm+',
      duration: 'Tiết kiệm 2 tháng',
      price: '1.990.000',
      popular: false,
      features: [
        'Mọi tính năng Pro',
        'Cảnh báo qua Zalo/SMS',
        'Quyền cho nhiều nhân sự',
        'Ưu tiên hỗ trợ',
        'Tùy biến mẫu quy trình'
      ],
      buttonText: 'Chọn Farm+',
      buttonVariant: 'default'
    }
  ];

  const features = [
    {
      icon: Bell,
      title: 'Cảnh báo sâu bệnh',
      description: 'Nhận thông báo sớm theo cây trồng & vùng thời tiết.'
    },
    {
      icon: Calendar,
      title: 'Lịch tưới & bón',
      description: 'Gợi ý tưới/bón đúa theo tuổi cây, âm độ và dự báo mưa.'
    },
    {
      icon: Cloud,
      title: 'Cảnh báo thời tiết',
      description: 'Thông báo mưa lớn, nắng nóng, gió mạnh theo vị trí vườn.'
    },
    {
      icon: Book,
      title: 'Nhật ký vườn',
      description: 'Ghi chép nhanh – xuất báo cáo cho hợp tác xã/doanh nghiệp.'
    }
  ];

  const faqs = [
    {
      question: 'Gói Pro khác Starter thế nào?',
      answer: 'Pro có cảnh báo nâng cao theo giống, dồng bộ & cảnh báo thời tiết địa phương. Starter chỉ có các gợi ý cơ bản.'
    },
    {
      question: 'Tôi có thể hủy bất cứ lúc nào không?',
      answer: 'Có, bạn có thể hủy đăng ký bất cứ lúc nào. Không có phí hủy và bạn vẫn sử dụng được dịch vụ đến hết kỳ thanh toán.'
    },
    {
      question: 'Có hỗ trợ thanh toán chuyển khoản?',
      answer: 'Có, chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng, VNPay, Momo và các ví điện tử phổ biến.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Topographic Background */}
      <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-900 text-white overflow-hidden">
        {/* Topographic Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            <path d="M0,100 Q250,50 500,100 T1000,100" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            <path d="M0,150 Q250,100 500,150 T1000,150" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            <path d="M0,200 Q250,150 500,200 T1000,200" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            <path d="M0,250 Q250,200 500,250 T1000,250" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            <path d="M0,300 Q250,250 500,300 T1000,300" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            <circle cx="150" cy="120" r="40" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <circle cx="150" cy="120" r="60" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <circle cx="150" cy="120" r="80" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <circle cx="800" cy="200" r="50" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <circle cx="800" cy="200" r="70" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <circle cx="800" cy="200" r="90" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
          </svg>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-700 text-white px-4 py-1 rounded-full text-sm mb-4">
              Dịch vụ
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Đăng ký gói chăm sóc<br />cây ăn quả cho nông hộ
            </h1>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Theo dõi vườn cây, nhận cảnh báo sâu bệnh vì lịch tưới bón thông minh – thiết kế riêng cho
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-white ${plan.popular ? 'ring-2 ring-emerald-500 shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Phổ biến
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.duration}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">₫/năm</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    {plan.buttonText}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Giá đã bao gồm thuế nếu có.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Đăng ký nhận tin & ưu đãi
                </h2>
                <p className="text-gray-600">
                  Chúng tôi sẽ gửi hướng dẫn kỹnh tạo vườn, kèm 7 ngày dùng thử Pro.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="flex-1 md:w-64"
                />
                <Button className="text-white bg-gray-900 hover:bg-gray-800">
                  Đăng ký
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Bằng việc đăng ký bạn đồng ý với Điều khoản & Chính sách bảo mật.
            </p>
          </div>

          {/* Promo Box */}
          <div className="max-w-3xl mx-auto mt-8">
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">Gợi ý</span>
                    </div>
                    <p className="text-emerald-800">Gói 1.990.000 rất chi tiết</p>
                  </div>
                  <Button variant="link" className="text-emerald-700">
                    Tư vấn nhanh →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Câu hỏi thường gặp
            </h2>
            <p className="text-gray-600">
              Nếu không thấy câu trả lời, hãy nhắn chúng tôi qua chat.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}