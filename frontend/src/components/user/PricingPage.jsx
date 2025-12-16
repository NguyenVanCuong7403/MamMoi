import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Bell,
  Calendar,
  Cloud,
  Book,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";

export default function PricingPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await SubscriptionPlanRepository.getPaidPlans();
        // Transform backend data to frontend format
        const transformedPlans = data.map((plan, index) => {
          // Xác định mô tả gói dựa trên maxGardens/maxTreesPerGarden
          // Sử dụng giá từ database (plan.price) thay vì hardcode
          let planDescription = "";
          // Parse giá từ database, đảm bảo là số
          let planPrice = Number(plan.price) || 0; // Sử dụng giá từ database

          // Gói 1: 1 vườn và vườn 5 cây
          if (plan.maxGardens === 1 && plan.maxTreesPerGarden === 5) {
            planDescription = "Tạo được 1 vườn và vườn 5 cây";
          }
          // Gói 2: 5 Vườn và mỗi vườn 5 cây
          else if (plan.maxGardens === 5 && plan.maxTreesPerGarden === 5) {
            planDescription = "Tạo 5 Vườn và mỗi vườn 5 cây";
          }
          // Gói 3: Không giới hạn vườn và cây trong vườn
          else if (!plan.maxGardens && !plan.maxTreesPerGarden) {
            planDescription = "Không giới hạn vườn và cây trong vườn";
          }
          // Fallback: dựa trên description từ database hoặc index
          else {
            if (plan.description) {
              planDescription = plan.description;
            } else if (index === 0) {
              planDescription = "Tạo được 1 vườn và vườn 5 cây";
            } else if (index === 1) {
              planDescription = "Tạo 5 Vườn và mỗi vườn 5 cây";
            } else {
              planDescription = "Không giới hạn vườn và cây trong vườn";
            }
          }

          // Tạo features list
          const features = [];
          if (plan.features) {
            // Handle JSON array string like "[\"item1\", \"item2\"]"
            if (
              typeof plan.features === "string" &&
              plan.features.startsWith("[")
            ) {
              try {
                const parsed = JSON.parse(plan.features);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  features.push(...parsed);
                }
              } catch { }
            }
            // Handle newline-separated string
            if (features.length === 0) {
              const parsed = plan.features.split("\n").filter((f) => f.trim());
              if (parsed.length > 0) {
                features.push(...parsed);
              }
            }
          }

          // Nếu không có features từ backend, tạo từ mô tả gói
          if (features.length === 0) {
            features.push(planDescription);
          }

          return {
            id: plan.planId,
            name: plan.planName,
            duration: "12 tháng",
            monthlyPrice: planPrice,
            yearlyPrice: planPrice * 12, // Giá năm = giá tháng * 12
            popular: index === 1, // Middle plan is popular
            features: features,
            buttonText: index === 0 ? "Bắt đầu" : `Chọn ${plan.planName}`,
            buttonVariant: "default",
            maxGardens: plan.maxGardens,
            maxTreesPerGarden: plan.maxTreesPerGarden,
          };
        });
        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch current user subscription
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const subscription =
          await SubscriptionPlanRepository.getCurrentUserSubscription();
        if (subscription) {
          setCurrentSubscription(subscription);
        }
      } catch (error) {
        console.error("Error fetching current subscription:", error);
      }
    };
    fetchCurrentSubscription();
  }, []);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Helper function to get plan tier (higher number = higher tier)
  const getPlanTier = (plan) => {
    // Determine tier based on maxGardens and maxTreesPerGarden
    if (!plan.maxGardens && !plan.maxTreesPerGarden) {
      return 3; // Unlimited plan (highest tier)
    } else if (plan.maxGardens === 5) {
      return 2; // Medium tier (5 gardens)
    } else if (plan.maxGardens === 1) {
      return 1; // Lowest tier (1 garden)
    }
    // Fallback: use maxGardens value
    return plan.maxGardens || 0;
  };

  // Helper function to check if a plan should be disabled
  const isPlanDisabled = (plan) => {
    if (!currentSubscription) return false;

    const currentPlanTier = getPlanTier(
      plans.find((p) => p.id === currentSubscription.planId) || {}
    );
    const planTier = getPlanTier(plan);

    // Disable if it's the current plan or a lower tier
    return planTier <= currentPlanTier;
  };

  const handleSelectPlan = (plan) => {
    // Check if plan is disabled
    if (isPlanDisabled(plan)) {
      return; // Do nothing if plan is disabled
    }

    // Navigate to checkout with plan ID
    // PricingPage shows monthlyPrice as the main price
    navigate("/checkout", {
      state: {
        planId: plan.id,
        planName: plan.name,
        price: plan.monthlyPrice,
        isYearly: false, // Monthly subscription
      },
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  const features = [
    {
      icon: Bell,
      title: "Cảnh báo sâu bệnh",
      description: "Nhận thông báo sớm theo cây trồng & vùng thời tiết.",
    },
    {
      icon: Calendar,
      title: "Lịch tưới & bón",
      description: "Gợi ý tưới/bón đúa theo tuổi cây, âm độ và dự báo mưa.",
    },
    {
      icon: Cloud,
      title: "Cảnh báo thời tiết",
      description: "Thông báo mưa lớn, nắng nóng, gió mạnh theo vị trí vườn.",
    },
    {
      icon: Book,
      title: "Nhật ký vườn",
      description: "Ghi chép nhanh – xuất báo cáo cho hợp tác xã/doanh nghiệp.",
    },
  ];

  const faqs = [
    {
      question: "Gói Pro khác Starter thế nào?",
      answer:
        "Pro có cảnh báo nâng cao theo giống, dồng bộ & cảnh báo thời tiết địa phương. Starter chỉ có các gợi ý cơ bản.",
    },
    {
      question: "Tôi có thể hủy bất cứ lúc nào không?",
      answer:
        "Có, bạn có thể hủy đăng ký bất cứ lúc nào. Không có phí hủy và bạn vẫn sử dụng được dịch vụ đến hết kỳ thanh toán.",
    },
    {
      question: "Có hỗ trợ thanh toán chuyển khoản?",
      answer:
        "Có, chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng, VNPay, Momo và các ví điện tử phổ biến.",
    },
  ];

  return (
    <div className="mm-fluid-page min-h-screen bg-gray-50">
      {/* Hero Section with Topographic Background */}
      <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-900 text-white overflow-hidden">
        {/* Topographic Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M0,100 Q250,50 500,100 T1000,100"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M0,150 Q250,100 500,150 T1000,150"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M0,200 Q250,150 500,200 T1000,200"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M0,250 Q250,200 500,250 T1000,250"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M0,300 Q250,250 500,300 T1000,300"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="150"
              cy="120"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
            <circle
              cx="150"
              cy="120"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
            <circle
              cx="150"
              cy="120"
              r="80"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
            <circle
              cx="800"
              cy="200"
              r="50"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
            <circle
              cx="800"
              cy="200"
              r="70"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
            <circle
              cx="800"
              cy="200"
              r="90"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
          </svg>
        </div>

        <div className="mm-fluid-shell relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-700 text-white px-4 py-1 rounded-full text-sm mb-4">
              Dịch vụ
            </span>
            <h1 className="text-[clamp(28px,5vw,48px)] font-bold mb-4 mm-text-wrap-safe break-words">
              Đăng ký gói chăm sóc
              <br className="hidden md:block" />
              cây ăn quả cho nông hộ
            </h1>
            <p className="mm-fluid-text text-emerald-100 max-w-2xl mx-auto text-[clamp(14px,1.8vw,18px)] mm-text-wrap-safe break-words">
              Theo dõi vườn cây, nhận cảnh báo sâu bệnh vì lịch tưới bón thông
              minh – thiết kế riêng cho
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mm-fluid-shell grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading
              ? // Loading skeleton
              [1, 2, 3].map((i) => (
                <Card key={i} className="bg-white animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded mb-6 w-3/4"></div>
                    <div className="space-y-3 mb-6">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-4 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
              : plans.map((plan, index) => {
                  const currentIndex =
                    currentSubscription && plans
                      ? plans.findIndex(
                          (p) => p.id === currentSubscription.planId
                        )
                      : -1;
                  const isCurrentPlan =
                    currentSubscription &&
                    currentSubscription.planId === plan.id;
                  // Disable current plan and any plan lower (index <= currentIndex)
                  const isLowerOrCurrent =
                    currentIndex >= 0 && index <= currentIndex;
                  return (
                    <Card
                      key={plan.id}
                      className={`relative bg-white flex flex-col ${
                        plan.popular
                          ? "ring-2 ring-emerald-500 shadow-xl scale-105"
                          : ""
                      } ${
                        isLowerOrCurrent ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Phổ biến
                          </span>
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                            Bạn đang ở gói này
                          </span>
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex-1">
                          <div className="mb-6">
                            <h3 className="text-[clamp(18px,2.5vw,22px)] font-bold text-gray-900 mb-1 mm-text-wrap-safe break-words">
                              {plan.name}
                            </h3>
                            <p className="text-[clamp(12px,1.5vw,14px)] text-gray-600 mm-text-wrap-safe break-words">
                              {plan.duration}
                            </p>
                          </div>

                          <div className="mb-6">
                            <div className="flex items-baseline flex-wrap">
                              <span className="text-[clamp(28px,4vw,36px)] font-bold text-gray-900 mm-text-wrap-safe break-words">
                                {formatPrice(plan.monthlyPrice)}
                              </span>
                              <span className="text-[clamp(12px,1.5vw,14px)] text-gray-600 ml-1 mm-text-wrap-safe break-words">
                                ₫/tháng
                              </span>
                            </div>
                            <p className="text-[clamp(12px,1.5vw,14px)] text-gray-500 mt-1 mm-text-wrap-safe break-words">
                              ({formatPrice(plan.yearlyPrice)}₫/năm)
                            </p>
                          </div>

                          <ul className="space-y-3 mb-6">
                            {plan.features.length > 0 ? (
                              plan.features.map((feature, fIndex) => (
                                <li
                                  key={fIndex}
                                  className="flex items-start gap-2"
                                >
                                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                    {feature}
                                  </span>
                                </li>
                              ))
                            ) : (
                              <>
                                <li className="flex items-start gap-2">
                                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                    {plan.maxGardens
                                      ? `Tối đa ${plan.maxGardens} vườn`
                                      : "Không giới hạn vườn"}
                                  </span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                    {plan.maxTreesPerGarden
                                      ? `Tối đa ${plan.maxTreesPerGarden} cây/vườn`
                                      : "Không giới hạn cây"}
                                  </span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div className="mt-auto">
                          <Button
                            className={`w-full ${
                              plan.popular
                                ? "bg-gray-900 hover:bg-gray-800"
                                : "bg-gray-900 hover:bg-gray-800"
                            } ${
                              isLowerOrCurrent
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                            onClick={() => handleSelectPlan(plan)}
                            disabled={isLowerOrCurrent}
                          >
                            {isCurrentPlan ? "Đang dùng" : plan.buttonText}
                          </Button>

                          {isLowerOrCurrent && !isCurrentPlan && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                              Bạn đang ở gói thấp hơn hoặc tương đương
                            </p>
                          )}

                          <p className="text-xs text-gray-500 text-center mt-3">
                            Giá đã bao gồm thuế nếu có.
                          </p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline flex-wrap">
                            <span className="text-[clamp(28px,4vw,36px)] font-bold text-gray-900 mm-text-wrap-safe break-words">
                              {formatPrice(plan.monthlyPrice)}
                            </span>
                            <span className="text-[clamp(12px,1.5vw,14px)] text-gray-600 ml-1 mm-text-wrap-safe break-words">
                              ₫/tháng
                            </span>
                          </div>
                          <p className="text-[clamp(12px,1.5vw,14px)] text-gray-500 mt-1 mm-text-wrap-safe break-words">
                            ({formatPrice(plan.yearlyPrice)}₫/năm)
                          </p>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.length > 0 ? (
                            plan.features.map((feature, fIndex) => (
                              <li key={fIndex} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                  {feature}
                                </span>
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                  {plan.maxGardens
                                    ? `Tối đa ${plan.maxGardens} vườn`
                                    : "Không giới hạn vườn"}
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="text-[clamp(12px,1.5vw,14px)] text-gray-700 mm-text-wrap-safe break-words">
                                  {plan.maxTreesPerGarden
                                    ? `Tối đa ${plan.maxTreesPerGarden} cây/vườn`
                                    : "Không giới hạn cây"}
                                </span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <Button
                          className={`w-full ${plan.popular
                            ? "bg-gray-900 hover:bg-gray-800"
                            : "bg-gray-900 hover:bg-gray-800"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isDisabled}
                        >
                          {isCurrentPlan
                            ? "Gói hiện tại"
                            : isDisabled
                              ? "Không khả dụng"
                              : plan.buttonText}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                          {isDisabled && !isCurrentPlan
                            ? "Bạn chỉ có thể nâng cấp lên gói cao hơn."
                            : "Giá đã bao gồm thuế nếu có."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mm-fluid-shell container mx-auto px-4 py-16">
        <div className="mm-fluid-shell grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New section: Thông tin & Tư vấn */}
      <div className="mm-fluid-shell container mx-auto px-4 py-12">
        <div className="mm-fluid-shell max-w-6xl mx-auto">
          <Card className="bg-white">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thông tin & Tư vấn
                </h2>
                <p className="text-gray-600 mb-2">
                  Cần trợ giúp chọn gói phù hợp cho vườn của bạn? Chúng tôi hỗ
                  trợ tư vấn miễn phí qua email hoặc gọi điện. Đội ngũ sẽ phản
                  hồi trong vòng 24 giờ làm việc.
                </p>
                <p className="text-sm text-gray-500">
                  Email:{" "}
                  <a className="text-emerald-600">support@mamnoi.example</a>
                  &nbsp;•&nbsp; Hotline:{" "}
                  <span className="font-medium">0123 456 789</span>
                </p>
              </div>
              <div>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() =>
                    (window.location.href =
                      "mailto:support@mamnoi.example?subject=Y%C3%AAn%20c%E1%BA%A7u%20t%C6%B0%20v%E1%BA%A5n%20g%C3%B3i%20ch%E1%BB%8Dn")
                  }
                >
                  Liên hệ ngay
                </Button>
              </div>
            </div>
            <p className="mm-fluid-text text-xs text-gray-500 mt-4">
              Bằng việc đăng ký bạn đồng ý với Điều khoản & Chính sách bảo mật.
            </p>
          </div>

          {/* Promo Box */}
          <div className="mm-fluid-shell max-w-3xl mx-auto mt-8">
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">
                        Gợi ý
                      </span>
                    </div>
                    <p className="mm-fluid-text text-emerald-800">
                      {plans.length > 0
                        ? `Gói ${plans[plans.length - 1]?.name} rất chi tiết`
                        : "Gói Farm+ rất chi tiết"}
                    </p>
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
      <div className="mm-fluid-shell container mx-auto px-4 py-16">
        <div className="mm-fluid-shell max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Câu hỏi thường gặp
            </h2>
            <p className="mm-fluid-text text-gray-600">
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
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === index ? "transform rotate-180" : ""
                        }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 text-gray-600">
                      <p className="mm-fluid-text">{faq.answer}</p>
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
