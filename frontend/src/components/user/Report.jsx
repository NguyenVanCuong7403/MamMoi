import React, { useState, useRef } from "react";
import {
  HelpCircle,
  Upload,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LivingBackground } from "@/components/background";
import SupportRequestRepository from "@/API/repositories/SupportRequestRepository";
import ApiClient from "@/API/ApiClient";
import { useAuth } from "@/API/context/AuthContext";
import { useNavigate } from "react-router-dom";

/* =========================================================
   Theme & constants
========================================================= */
const BG = "#1F302F";
const PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};
const CONTAINER =
  "mm-fluid-shell mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10 2xl:px-16";

const INPUT_OK =
  "h-14 w-full rounded-xl bg-white/95 border border-white/30 placeholder:text-neutral-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base";
const INPUT_ERR =
  "h-14 w-full rounded-xl bg-white/95 border-2 border-rose-500 placeholder:text-neutral-500 focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-base";
const SELECT_OK =
  "h-14 w-full rounded-xl border bg-white/95 border-white/30 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500";
const SELECT_ERR =
  "h-14 w-full rounded-xl border-2 border-rose-500 bg-white/95 px-4 text-base focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500";
const TEXTAREA_OK =
  "min-h-[200px] w-full rounded-xl bg-white/95 border border-white/30 placeholder:text-neutral-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 p-4 text-base resize-y";
const TEXTAREA_ERR =
  "min-h-[200px] w-full rounded-xl bg-white/95 border-2 border-rose-500 placeholder:text-neutral-500 focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 p-4 text-base resize-y";

const CATEGORIES = [
  { value: "", label: "(Chọn phân loại)" },
  { value: "payment", label: "Thanh toán" },
  { value: "tree", label: "Cây" },
  { value: "auth", label: "Đăng nhập & Đăng kí" },
  { value: "system", label: "Hệ thống" },
];

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "",
    email: "",
    title: "",
    content: "",
    image: null,
    imagePreview: null,
  });

  const [touched, setTouched] = useState({
    category: false,
    email: false,
    title: false,
    content: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = "Vui lòng chọn phân loại";
    }

    // Email chỉ bắt buộc khi user chưa đăng nhập và chọn category "auth"
    if (form.category === "auth" && !user) {
      if (!form.email.trim()) {
        newErrors.email = "Vui lòng nhập email";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
          newErrors.email = "Email không hợp lệ";
        }
      }
    }

    if (!form.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!form.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if category is required and show error on other fields
  const shouldShowCategoryError = () => {
    return (
      !form.category && (touched.title || touched.content || touched.email)
    );
  };

  // Check if guest selected a non-auth category (should disable form)
  const isGuestRestrictedCategory =
    !user && form.category && form.category !== "auth";

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    // Check if guest is trying to select a non-auth category
    if (!user && value && value !== "auth") {
      setErrors({
        category: "bạn phải đăng nhập để sử dụng loại hỗ trợ này",
      });
      setForm((prev) => ({
        ...prev,
        category: value, // Still set it to show the error
        email: "",
        title: "",
        content: "",
        image: null,
        imagePreview: null,
      }));
      setTouched({
        category: true,
        email: false,
        title: false,
        content: false,
      });
      // Clear image preview URL if exists
      if (form.imagePreview) {
        URL.revokeObjectURL(form.imagePreview);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setForm((prev) => ({
        ...prev,
        category: value,
        email: value !== "auth" ? "" : prev.email, // Clear email if not auth category
      }));
      setErrors((prev) => ({ ...prev, category: "" }));
      setTouched((prev) => ({ ...prev, category: true }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (!form.category && field !== "category") {
      setErrors((prev) => ({
        ...prev,
        category: "Vui lòng chọn phân loại trước",
      }));
    }
    validate();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: preview,
      }));
    }
  };

  const removeImage = () => {
    if (form.imagePreview) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in (except for auth category which allows guests)
    if (!user && form.category !== "auth") {
      setShowLoginNotice(true);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowLoginNotice(false);
      }, 5000);
      return;
    }

    // Mark all fields as touched
    setTouched({
      category: true,
      email: form.category === "auth" && !user, // Only mark email as touched if auth category and guest
      title: true,
      content: true,
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare description with email if provided (only for guests)
      let description = form.content;
      if (form.category === "auth" && !user && form.email) {
        description = `${form.content}\n\nEmail liên hệ: ${form.email}`;
      } else if (form.category === "auth" && user && user.email) {
        // If user is logged in, include their account email
        description = `${form.content}\n\nEmail tài khoản: ${user.email}`;
      }

      // Prepare request data - API will auto-map category to priority
      const requestData = {
        subject: form.title,
        description: description,
        category: form.category || "other",
        // Priority will be auto-mapped by backend based on category
      };

      // Create support request payload - Backend expects PascalCase
      // Priority will be auto-mapped by backend based on category
      const requestPayload = {
        Subject: requestData.subject,
        Description: requestData.description,
        Category: requestData.category,
      };

      // If there's an image, upload it first and get the URL
      if (form.image) {
        try {
          const uploadResponse = await SupportRequestRepository.uploadImage(
            form.image
          );
          if (uploadResponse && uploadResponse.url) {
            requestPayload.AttachmentUrls = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with request creation even if image upload fails
          // You could optionally show a warning to the user here
        }
      }

      const response = await SupportRequestRepository.createRequest(
        requestPayload
      );

      if (response && response.success !== false) {
        // Show success modal
        setShowSuccessModal(true);
      } else {
        throw new Error(response?.message || "Không thể tạo yêu cầu hỗ trợ");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
      });

      let errorMsg = "Có lỗi xảy ra. Vui lòng thử lại sau.";

      if (error.status === 401) {
        errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.status === 400) {
        errorMsg =
          error.message ||
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!user && (
        <div
          className={`fixed top-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-300 ease-out ${showLoginNotice
            ? "opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 -translate-y-4 scale-95"
            }`}
        >
          <div
            className={`flex items-center gap-3 rounded-3xl bg-gradient-to-r from-emerald-400/90 to-teal-500/90 px-6 py-4 text-white shadow-[0_25px_65px_rgba(0,0,0,0.35)] backdrop-blur-lg ${showLoginNotice ? "animate-[pulse_1.5s_ease-in-out]" : ""
              }`}
          >
            <AlertCircle className="w-6 h-6" />
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase">
                Cần đăng nhập
              </p>
              <p className="text-sm">
                Bạn phải đăng nhập để gửi báo cáo này. Vui lòng đăng nhập và thử
                lại.
              </p>
            </div>
            <button
              onClick={() => {
                setShowLoginNotice(false);
                navigate("/auth");
              }}
              className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setShowLoginNotice(false)}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ Nền sống */}
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      {/* UI trên nền sống */}
      <div className="relative min-h-screen pt-[64px] z-10">
        <div className={`${CONTAINER} pt-8 pb-16`}>
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Trung tâm hỗ trợ vấn đề khẩn
            </h1>
          </div>

          {/* Removed AI intro + weather alert panels */}

          {/* Form Card */}
          <Card className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Field */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-3">
                    Phân loại <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={handleCategoryChange}
                    onBlur={() => handleFieldBlur("category")}
                    className={
                      shouldShowCategoryError() ||
                        (touched.category && errors.category) ||
                        isGuestRestrictedCategory
                        ? SELECT_ERR
                        : SELECT_OK
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {shouldShowCategoryError() && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        Vui lòng chọn phân loại trước khi điền các mục khác
                      </span>
                    </div>
                  )}
                  {touched.category && errors.category && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.category}</span>
                    </div>
                  )}
                </div>

                {/* Email Field - Only show when category is "auth" and user is not logged in */}
                {!user && form.category === "auth" && (
                  <div className="transition-all duration-300 ease-in-out">
                    <label className="block text-white text-lg font-semibold mb-3">
                      Email <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      onBlur={() => handleFieldBlur("email")}
                      placeholder="Nhập email của bạn"
                      className={
                        touched.email && errors.email ? INPUT_ERR : INPUT_OK
                      }
                    />
                    {touched.email && errors.email && (
                      <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Title Field */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-3">
                    Tiêu đề <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, title: e.target.value }));
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    onBlur={() => handleFieldBlur("title")}
                    placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
                    className={
                      shouldShowCategoryError() ||
                        (touched.title && errors.title)
                        ? INPUT_ERR
                        : INPUT_OK
                    }
                    disabled={!form.category || isGuestRestrictedCategory}
                  />
                  {shouldShowCategoryError() && !form.category && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Vui lòng chọn phân loại trước</span>
                    </div>
                  )}
                  {touched.title && errors.title && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.title}</span>
                    </div>
                  )}
                </div>

                {/* Content Field */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-3">
                    Nội dung <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => {
                      // Prevent input when guest selects restricted category
                      if (isGuestRestrictedCategory) return;
                      setForm((prev) => ({ ...prev, content: e.target.value }));
                      setErrors((prev) => ({ ...prev, content: "" }));
                    }}
                    onBlur={() => {
                      if (!isGuestRestrictedCategory) {
                        handleFieldBlur("content");
                      }
                    }}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    className={`${shouldShowCategoryError() ||
                      (touched.content && errors.content)
                      ? TEXTAREA_ERR
                      : TEXTAREA_OK
                      } ${isGuestRestrictedCategory
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                      }`}
                    disabled={!form.category || isGuestRestrictedCategory}
                    readOnly={isGuestRestrictedCategory}
                  />
                  {shouldShowCategoryError() && !form.category && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Vui lòng chọn phân loại trước</span>
                    </div>
                  )}
                  {touched.content && errors.content && (
                    <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.content}</span>
                    </div>
                  )}
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-3">
                    Upload ảnh lỗi
                  </label>
                  <div className="space-y-4">
                    {!form.imagePreview ? (
                      <label
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/30 rounded-xl bg-white/5 transition-colors ${isGuestRestrictedCategory
                          ? "cursor-not-allowed"
                          : "hover:bg-white/10 cursor-pointer"
                          }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 text-white/60 mb-3" />
                          <p className="mb-2 text-base text-white/80">
                            <span className="font-semibold">
                              Click để chọn ảnh
                            </span>{" "}
                            hoặc kéo thả
                          </p>
                          <p className="text-sm text-white/60">
                            PNG, JPG, GIF (Tối đa 5MB)
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isGuestRestrictedCategory}
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-white/30">
                          <img
                            src={form.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-colors"
                            aria-label="Xóa ảnh"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-white/60 text-center">
                          {form.image?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !form.category ||
                      isGuestRestrictedCategory
                    }
                    className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Gửi Yêu cầu
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-semibold">
              Gửi yêu cầu thành công!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/reports");
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Xem danh sách báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-rose-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-semibold">
              Có lỗi xảy ra
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowErrorModal(false);
                if (errorMessage.includes("đăng nhập")) {
                  navigate("/auth");
                }
              }}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
            >
              {errorMessage.includes("đăng nhập") ? "Đăng nhập" : "Đóng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
