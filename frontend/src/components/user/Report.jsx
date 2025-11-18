import React, { useState, useRef } from "react";
import { HelpCircle, Upload, X, Send, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LivingBackground } from "@/components/background";

/* =========================================================
   Theme & constants
========================================================= */
const BG = "#1F302F";
const PALETTE = { 
  bg: "#1F302F", 
  leaf: "#D1DFB6", 
  ivory: "#FBFFDF", 
  accent: "#FFFFA5" 
};
const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10 2xl:px-16";

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
  const fileInputRef = useRef(null);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = "Vui lòng chọn phân loại";
    }

    if (form.category === "auth" && !form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (form.category === "auth" && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = "Email không hợp lệ";
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
    return !form.category && (touched.title || touched.content || touched.email);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: value,
      email: value !== "auth" ? "" : prev.email, // Clear email if not auth category
    }));
    setTouched((prev) => ({ ...prev, category: true }));
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (!form.category && field !== "category") {
      setErrors((prev) => ({ ...prev, category: "Vui lòng chọn phân loại trước" }));
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

    // Mark all fields as touched
    setTouched({
      category: true,
      email: form.category === "auth",
      title: true,
      content: true,
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.");
      
      // Reset form
      setForm({
        category: "",
        email: "",
        title: "",
        content: "",
        image: null,
        imagePreview: null,
      });
      setTouched({
        category: false,
        email: false,
        title: false,
        content: false,
      });
      setErrors({});
      removeImage();
    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
            Liên hệ & Hỗ trợ
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Vui lòng điền thông tin bên dưới và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>

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
                    shouldShowCategoryError() || (touched.category && errors.category)
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
                    <span>Vui lòng chọn phân loại trước khi điền các mục khác</span>
                  </div>
                )}
                {touched.category && errors.category && (
                  <div className="mt-2 flex items-center gap-2 text-rose-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.category}</span>
                  </div>
                )}
              </div>

              {/* Email Field - Only show when category is "auth" */}
              {form.category === "auth" && (
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
                    shouldShowCategoryError() || (touched.title && errors.title)
                      ? INPUT_ERR
                      : INPUT_OK
                  }
                  disabled={!form.category}
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
                    setForm((prev) => ({ ...prev, content: e.target.value }));
                    setErrors((prev) => ({ ...prev, content: "" }));
                  }}
                  onBlur={() => handleFieldBlur("content")}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  className={
                    shouldShowCategoryError() || (touched.content && errors.content)
                      ? TEXTAREA_ERR
                      : TEXTAREA_OK
                  }
                  disabled={!form.category}
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
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/30 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-white/60 mb-3" />
                        <p className="mb-2 text-base text-white/80">
                          <span className="font-semibold">Click để chọn ảnh</span> hoặc kéo thả
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
                  disabled={isSubmitting || !form.category}
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
    </>
  );
}

