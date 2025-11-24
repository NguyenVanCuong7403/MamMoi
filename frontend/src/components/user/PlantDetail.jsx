import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LivingBackground } from "@/components/background";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  Shield,
  Layers,
  Leaf,
  Sun,
  Snowflake,
  Waves,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Database,
  Bug,
  AlertTriangle,
  Clock,
  MapPin,
  Lightbulb,
  Droplet,
  Flower2,
  ChevronRight,
} from "lucide-react";
import TreeRepository from "@/API/repositories/TreeRepository";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
=======
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
>>>>>>> cuong
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const toleranceLabels = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
  None: "Không xác định",
};

const toleranceColors = {
<<<<<<< HEAD
  Low: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "text-rose-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-500" },
  High: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-500" },
  None: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: "text-slate-400" },
};

const severityColors = {
  High: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: "text-red-600" },
  Medium: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", icon: "text-orange-600" },
  Low: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", icon: "text-yellow-600" },
=======
  Low: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "text-rose-500",
  },
  Medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-500",
  },
  High: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "text-emerald-500",
  },
  None: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: "text-slate-400",
  },
};

const severityColors = {
  High: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    icon: "text-red-600",
  },
  Medium: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    icon: "text-orange-600",
  },
  Low: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    icon: "text-yellow-600",
  },
>>>>>>> cuong
};

// Comprehensive Demo Data - Merging DB fields with Wireframe extras
const demoPlantData = {
  1: {
    // DB Fields
    treeTypeName: "Xoài",
    scientificName: "Mangifera indica L.",
    category: "Cây ăn quả",
<<<<<<< HEAD
    description: "Xoài là loại cây ăn quả nhiệt đới phổ biến, có nguồn gốc từ Nam Á. Cây xoài có thể cao từ 10-30m, tán rộng, lá xanh đậm hình mũi mác. Quả xoài có nhiều giống với màu sắc và hương vị đa dạng, từ ngọt thanh đến chua ngọt. Xoài giàu vitamin A, C và chất xơ, rất tốt cho sức khỏe. Cây ưa khí hậu nóng ẩm, cần ánh sáng đầy đủ và đất thoát nước tốt.",
    imageUrl: "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=1600",
=======
    description:
      "Xoài là loại cây ăn quả nhiệt đới phổ biến, có nguồn gốc từ Nam Á. Cây xoài có thể cao từ 10-30m, tán rộng, lá xanh đậm hình mũi mác. Quả xoài có nhiều giống với màu sắc và hương vị đa dạng, từ ngọt thanh đến chua ngọt. Xoài giàu vitamin A, C và chất xơ, rất tốt cho sức khỏe. Cây ưa khí hậu nóng ẩm, cần ánh sáng đầy đủ và đất thoát nước tốt.",
    imageUrl:
      "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=1600",
>>>>>>> cuong
    averageLifespanYears: 30,
    optimalTemperatureMin: 24.0,
    optimalTemperatureMax: 30.0,
    optimalHumidityMin: 60.0,
    optimalHumidityMax: 80.0,
    droughtTolerance: "Medium",
    floodTolerance: "Low",
    frostTolerance: "None",
    windTolerance: "Medium",
    soilMasterId: 1,
    soilType: "Đất phù sa",
    // Wireframe Extra Fields
    varieties: [
<<<<<<< HEAD
      { name: "Cát Hòa Lộc A", description: "Giống xoài cao cấp, vỏ vàng, thơm đậm. Trọng lượng trung bình 300-500g/quả, năng suất 15-20 tấn/ha/năm.", imageUrl: "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400" },
      { name: "Cát Hòa Lộc B", description: "Giống xoài phù hợp xuất khẩu. Vỏ dày, chịu vận chuyển tốt, thời gian bảo quản lâu.", imageUrl: "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400" },
      { name: "Xoài Tứ Quý", description: "Cho trái quanh năm, năng suất ổn định. Thích hợp trồng ở vùng nhiệt đới.", imageUrl: "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400" },
      { name: "Xoài Thái", description: "Giống nhập khẩu, quả to, vị ngọt đậm. Thích hợp trồng ở vùng có khí hậu ổn định.", imageUrl: "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400" },
=======
      {
        name: "Cát Hòa Lộc A",
        description:
          "Giống xoài cao cấp, vỏ vàng, thơm đậm. Trọng lượng trung bình 300-500g/quả, năng suất 15-20 tấn/ha/năm.",
        imageUrl:
          "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400",
      },
      {
        name: "Cát Hòa Lộc B",
        description:
          "Giống xoài phù hợp xuất khẩu. Vỏ dày, chịu vận chuyển tốt, thời gian bảo quản lâu.",
        imageUrl:
          "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400",
      },
      {
        name: "Xoài Tứ Quý",
        description:
          "Cho trái quanh năm, năng suất ổn định. Thích hợp trồng ở vùng nhiệt đới.",
        imageUrl:
          "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400",
      },
      {
        name: "Xoài Thái",
        description:
          "Giống nhập khẩu, quả to, vị ngọt đậm. Thích hợp trồng ở vùng có khí hậu ổn định.",
        imageUrl:
          "https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400",
      },
>>>>>>> cuong
    ],
    careGuide: [
      "Bón thúc NPK 16-16-8 với liều lượng 0.5-1kg/cây vào đầu mùa mưa",
      "Tưới nước đều đặn 2-3 lần/tuần trong mùa khô, đảm bảo đất luôn ẩm nhưng không úng",
      "Cắt tỉa cành già, cành sâu bệnh sau mỗi vụ thu hoạch để cây phát triển tốt",
      "Phun thuốc phòng trừ sâu bệnh định kỳ, đặc biệt là rầy mềm và bệnh thán thư",
      "Bón phân hữu cơ 10-15kg/cây/năm để cải thiện chất lượng đất",
      "Che phủ gốc bằng rơm rạ hoặc cỏ khô để giữ ẩm và hạn chế cỏ dại",
    ],
    pests: [
<<<<<<< HEAD
      { name: "Rầy mềm", description: "Rầy mềm hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu sinh học hoặc dầu khoáng.", severity: "High" },
      { name: "Bệnh thán thư", description: "Bệnh do nấm gây ra, xuất hiện đốm đen trên lá và quả. Phòng trừ bằng thuốc trừ nấm và vệ sinh vườn.", severity: "High" },
      { name: "Ruồi đục quả", description: "Ruồi đẻ trứng vào quả non, ấu trùng phá hoại bên trong. Sử dụng bẫy pheromone và bao quả.", severity: "Medium" },
      { name: "Sâu đục thân", description: "Sâu đục vào thân cây làm cây suy yếu. Phòng trừ bằng cách quét vôi gốc và phun thuốc trừ sâu.", severity: "Low" },
    ],
    seasonalRoadmap: [
      { stage: "Gieo trồng", timing: "Tháng 5-6", action: "Chuẩn bị đất, trồng cây con, tưới nước đều đặn" },
      { stage: "Chăm sóc non", timing: "Tháng 7-9", action: "Bón phân lót, tưới nước, phòng trừ sâu bệnh" },
      { stage: "Phát triển", timing: "Tháng 10-12", action: "Bón thúc NPK, cắt tỉa cành, tạo tán" },
      { stage: "Ra hoa", timing: "Tháng 1-2", action: "Tưới nước đầy đủ, phun thuốc kích thích ra hoa nếu cần" },
      { stage: "Đậu quả", timing: "Tháng 3-4", action: "Bón phân kali, tưới nước, bao quả để tránh sâu bệnh" },
      { stage: "Thu hoạch", timing: "Tháng 5-6", action: "Thu hoạch khi quả chín 70-80%, bảo quản nơi khô ráo" },
=======
      {
        name: "Rầy mềm",
        description:
          "Rầy mềm hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu sinh học hoặc dầu khoáng.",
        severity: "High",
      },
      {
        name: "Bệnh thán thư",
        description:
          "Bệnh do nấm gây ra, xuất hiện đốm đen trên lá và quả. Phòng trừ bằng thuốc trừ nấm và vệ sinh vườn.",
        severity: "High",
      },
      {
        name: "Ruồi đục quả",
        description:
          "Ruồi đẻ trứng vào quả non, ấu trùng phá hoại bên trong. Sử dụng bẫy pheromone và bao quả.",
        severity: "Medium",
      },
      {
        name: "Sâu đục thân",
        description:
          "Sâu đục vào thân cây làm cây suy yếu. Phòng trừ bằng cách quét vôi gốc và phun thuốc trừ sâu.",
        severity: "Low",
      },
    ],
    seasonalRoadmap: [
      {
        stage: "Gieo trồng",
        timing: "Tháng 5-6",
        action: "Chuẩn bị đất, trồng cây con, tưới nước đều đặn",
      },
      {
        stage: "Chăm sóc non",
        timing: "Tháng 7-9",
        action: "Bón phân lót, tưới nước, phòng trừ sâu bệnh",
      },
      {
        stage: "Phát triển",
        timing: "Tháng 10-12",
        action: "Bón thúc NPK, cắt tỉa cành, tạo tán",
      },
      {
        stage: "Ra hoa",
        timing: "Tháng 1-2",
        action: "Tưới nước đầy đủ, phun thuốc kích thích ra hoa nếu cần",
      },
      {
        stage: "Đậu quả",
        timing: "Tháng 3-4",
        action: "Bón phân kali, tưới nước, bao quả để tránh sâu bệnh",
      },
      {
        stage: "Thu hoạch",
        timing: "Tháng 5-6",
        action: "Thu hoạch khi quả chín 70-80%, bảo quản nơi khô ráo",
      },
>>>>>>> cuong
    ],
    lightRequirement: "Ánh sáng đầy đủ (6-8 giờ/ngày)",
    waterRequirement: "Tưới đều đặn, 2-3 lần/tuần",
  },
  2: {
    treeTypeName: "Bơ",
    scientificName: "Persea americana Mill.",
    category: "Cây ăn quả",
<<<<<<< HEAD
    description: "Bơ là cây ăn quả có giá trị dinh dưỡng cao, nguồn gốc từ Trung Mỹ. Cây bơ có thể cao 15-20m, lá xanh đậm hình elip. Quả bơ chứa nhiều chất béo không bão hòa, vitamin E, K và kali. Bơ được sử dụng rộng rãi trong ẩm thực và làm đẹp. Cây ưa khí hậu nhiệt đới và cận nhiệt đới, cần đất thoát nước tốt và không chịu được ngập úng.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=1600",
=======
    description:
      "Bơ là cây ăn quả có giá trị dinh dưỡng cao, nguồn gốc từ Trung Mỹ. Cây bơ có thể cao 15-20m, lá xanh đậm hình elip. Quả bơ chứa nhiều chất béo không bão hòa, vitamin E, K và kali. Bơ được sử dụng rộng rãi trong ẩm thực và làm đẹp. Cây ưa khí hậu nhiệt đới và cận nhiệt đới, cần đất thoát nước tốt và không chịu được ngập úng.",
    imageUrl:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=1600",
>>>>>>> cuong
    averageLifespanYears: 25,
    optimalTemperatureMin: 20.0,
    optimalTemperatureMax: 28.0,
    optimalHumidityMin: 65.0,
    optimalHumidityMax: 85.0,
    droughtTolerance: "Low",
    floodTolerance: "None",
    frostTolerance: "Low",
    windTolerance: "Medium",
    soilMasterId: 2,
    soilType: "Đất đỏ bazan",
    varieties: [
<<<<<<< HEAD
      { name: "Hass Peru", description: "Giống bơ nhập khẩu, thịt dẻo. Vỏ dày màu xanh đậm, chuyển sang tím khi chín. Trọng lượng 200-300g/quả.", imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
      { name: "Hass Highlands", description: "Dễ bảo quản và vận chuyển. Thích hợp trồng ở vùng cao, chịu lạnh tốt hơn.", imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
      { name: "Bơ Sáp", description: "Giống bơ địa phương, thịt vàng, béo ngậy. Năng suất cao, phù hợp thị trường nội địa.", imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
=======
      {
        name: "Hass Peru",
        description:
          "Giống bơ nhập khẩu, thịt dẻo. Vỏ dày màu xanh đậm, chuyển sang tím khi chín. Trọng lượng 200-300g/quả.",
        imageUrl:
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
      },
      {
        name: "Hass Highlands",
        description:
          "Dễ bảo quản và vận chuyển. Thích hợp trồng ở vùng cao, chịu lạnh tốt hơn.",
        imageUrl:
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
      },
      {
        name: "Bơ Sáp",
        description:
          "Giống bơ địa phương, thịt vàng, béo ngậy. Năng suất cao, phù hợp thị trường nội địa.",
        imageUrl:
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
      },
>>>>>>> cuong
    ],
    careGuide: [
      "Bón phân NPK 20-20-15 với liều lượng 0.5-1.5kg/cây vào đầu và giữa mùa mưa",
      "Tưới nước sâu 1-2 lần/tuần, đảm bảo đất ẩm nhưng không úng nước",
      "Cắt tỉa cành vượt, cành sâu bệnh để tạo tán đều và thông thoáng",
      "Phòng trừ bệnh thối rễ bằng cách cải thiện hệ thống thoát nước",
      "Bón phân hữu cơ 15-20kg/cây/năm để tăng độ phì nhiêu của đất",
      "Che phủ gốc bằng mùn hữu cơ để giữ ẩm và điều hòa nhiệt độ",
    ],
    pests: [
<<<<<<< HEAD
      { name: "Bệnh thối rễ", description: "Bệnh do nấm Phytophthora gây ra, làm rễ thối, cây chết. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.", severity: "High" },
      { name: "Rệp sáp", description: "Rệp sáp hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu hoặc thiên địch.", severity: "Medium" },
      { name: "Sâu đục quả", description: "Sâu đục vào quả non làm quả rụng. Sử dụng bẫy pheromone và phun thuốc trừ sâu.", severity: "Low" },
    ],
    seasonalRoadmap: [
      { stage: "Trồng cây", timing: "Tháng 4-5", action: "Chuẩn bị hố trồng, trồng cây con, tưới nước đều" },
      { stage: "Chăm sóc", timing: "Tháng 6-8", action: "Bón phân lót, tưới nước, làm cỏ" },
      { stage: "Phát triển", timing: "Tháng 9-11", action: "Bón thúc, cắt tỉa, tạo tán" },
      { stage: "Ra hoa", timing: "Tháng 12-2", action: "Tưới nước đầy đủ, phun thuốc kích thích" },
      { stage: "Đậu quả", timing: "Tháng 3-5", action: "Bón phân kali, tưới nước, chăm sóc quả" },
      { stage: "Thu hoạch", timing: "Tháng 6-8", action: "Thu hoạch khi quả chín, bảo quản lạnh" },
=======
      {
        name: "Bệnh thối rễ",
        description:
          "Bệnh do nấm Phytophthora gây ra, làm rễ thối, cây chết. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.",
        severity: "High",
      },
      {
        name: "Rệp sáp",
        description:
          "Rệp sáp hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu hoặc thiên địch.",
        severity: "Medium",
      },
      {
        name: "Sâu đục quả",
        description:
          "Sâu đục vào quả non làm quả rụng. Sử dụng bẫy pheromone và phun thuốc trừ sâu.",
        severity: "Low",
      },
    ],
    seasonalRoadmap: [
      {
        stage: "Trồng cây",
        timing: "Tháng 4-5",
        action: "Chuẩn bị hố trồng, trồng cây con, tưới nước đều",
      },
      {
        stage: "Chăm sóc",
        timing: "Tháng 6-8",
        action: "Bón phân lót, tưới nước, làm cỏ",
      },
      {
        stage: "Phát triển",
        timing: "Tháng 9-11",
        action: "Bón thúc, cắt tỉa, tạo tán",
      },
      {
        stage: "Ra hoa",
        timing: "Tháng 12-2",
        action: "Tưới nước đầy đủ, phun thuốc kích thích",
      },
      {
        stage: "Đậu quả",
        timing: "Tháng 3-5",
        action: "Bón phân kali, tưới nước, chăm sóc quả",
      },
      {
        stage: "Thu hoạch",
        timing: "Tháng 6-8",
        action: "Thu hoạch khi quả chín, bảo quản lạnh",
      },
>>>>>>> cuong
    ],
    lightRequirement: "Ánh sáng đầy đủ (6-8 giờ/ngày)",
    waterRequirement: "Tưới sâu 1-2 lần/tuần",
  },
  3: {
    treeTypeName: "Thanh Long",
    scientificName: "Hylocereus undatus",
    category: "Cây ăn quả",
<<<<<<< HEAD
    description: "Thanh long là loại cây xương rồng leo, có nguồn gốc từ Trung Mỹ. Cây có thân dạng cành dẹt, màu xanh, có gai. Quả thanh long có vỏ màu đỏ hoặc vàng, ruột trắng hoặc đỏ với nhiều hạt đen nhỏ. Thanh long giàu vitamin C, chất xơ và chất chống oxy hóa. Cây chịu hạn tốt, thích hợp vùng khô hạn, cần giá đỡ để leo và ánh sáng đầy đủ.",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1600",
=======
    description:
      "Thanh long là loại cây xương rồng leo, có nguồn gốc từ Trung Mỹ. Cây có thân dạng cành dẹt, màu xanh, có gai. Quả thanh long có vỏ màu đỏ hoặc vàng, ruột trắng hoặc đỏ với nhiều hạt đen nhỏ. Thanh long giàu vitamin C, chất xơ và chất chống oxy hóa. Cây chịu hạn tốt, thích hợp vùng khô hạn, cần giá đỡ để leo và ánh sáng đầy đủ.",
    imageUrl:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1600",
>>>>>>> cuong
    averageLifespanYears: 20,
    optimalTemperatureMin: 22.0,
    optimalTemperatureMax: 32.0,
    optimalHumidityMin: 50.0,
    optimalHumidityMax: 70.0,
    droughtTolerance: "High",
    floodTolerance: "Low",
    frostTolerance: "None",
    windTolerance: "Medium",
    soilMasterId: 3,
    soilType: "Đất cát pha",
    varieties: [
<<<<<<< HEAD
      { name: "Ruột đỏ Peru", description: "Màu ruột đỏ đậm, vị ngọt thanh. Trọng lượng 150-250g/quả, năng suất 12-18 tấn/ha/năm.", imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400" },
      { name: "Ruột đỏ Premium", description: "Thu hoạch quanh năm. Chất lượng cao, phù hợp xuất khẩu.", imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400" },
      { name: "Thanh Long ruột trắng", description: "Giống truyền thống, dễ trồng. Năng suất ổn định, thích hợp vùng khô hạn.", imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400" },
=======
      {
        name: "Ruột đỏ Peru",
        description:
          "Màu ruột đỏ đậm, vị ngọt thanh. Trọng lượng 150-250g/quả, năng suất 12-18 tấn/ha/năm.",
        imageUrl:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
      },
      {
        name: "Ruột đỏ Premium",
        description: "Thu hoạch quanh năm. Chất lượng cao, phù hợp xuất khẩu.",
        imageUrl:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
      },
      {
        name: "Thanh Long ruột trắng",
        description:
          "Giống truyền thống, dễ trồng. Năng suất ổn định, thích hợp vùng khô hạn.",
        imageUrl:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
      },
>>>>>>> cuong
    ],
    careGuide: [
      "Bón phân NPK 15-15-15 với liều lượng 0.3-0.5kg/cây vào đầu mùa mưa",
      "Tưới nước 1-2 lần/tuần trong mùa khô, cây chịu hạn tốt nên không cần tưới quá nhiều",
      "Cắt tỉa cành già, cành sâu bệnh để cây tập trung dinh dưỡng cho quả",
      "Làm giá đỡ chắc chắn để cây leo, đảm bảo ánh sáng đầy đủ",
      "Bón phân hữu cơ 5-10kg/cây/năm để cải thiện đất",
      "Phun thuốc phòng trừ nấm bệnh vào mùa mưa",
    ],
    pests: [
<<<<<<< HEAD
      { name: "Bệnh thối gốc", description: "Bệnh do nấm gây ra khi đất quá ẩm. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.", severity: "High" },
      { name: "Rệp sáp", description: "Rệp sáp hút nhựa cây, làm cây suy yếu. Phòng trừ bằng thuốc trừ sâu hoặc dầu khoáng.", severity: "Medium" },
      { name: "Ruồi đục quả", description: "Ruồi đẻ trứng vào quả, ấu trùng phá hoại. Sử dụng bẫy pheromone và bao quả.", severity: "Low" },
    ],
    seasonalRoadmap: [
      { stage: "Trồng cây", timing: "Tháng 3-4", action: "Chuẩn bị giá đỡ, trồng cây con, tưới nước" },
      { stage: "Chăm sóc", timing: "Tháng 5-7", action: "Bón phân, tưới nước, làm cỏ" },
      { stage: "Phát triển", timing: "Tháng 8-10", action: "Cắt tỉa, bón thúc, chăm sóc cành" },
      { stage: "Ra hoa", timing: "Tháng 11-1", action: "Tưới nước, phun thuốc kích thích" },
      { stage: "Đậu quả", timing: "Tháng 2-4", action: "Bón phân, tưới nước, bao quả" },
      { stage: "Thu hoạch", timing: "Tháng 5-7", action: "Thu hoạch khi quả chín, bảo quản mát" },
=======
      {
        name: "Bệnh thối gốc",
        description:
          "Bệnh do nấm gây ra khi đất quá ẩm. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.",
        severity: "High",
      },
      {
        name: "Rệp sáp",
        description:
          "Rệp sáp hút nhựa cây, làm cây suy yếu. Phòng trừ bằng thuốc trừ sâu hoặc dầu khoáng.",
        severity: "Medium",
      },
      {
        name: "Ruồi đục quả",
        description:
          "Ruồi đẻ trứng vào quả, ấu trùng phá hoại. Sử dụng bẫy pheromone và bao quả.",
        severity: "Low",
      },
    ],
    seasonalRoadmap: [
      {
        stage: "Trồng cây",
        timing: "Tháng 3-4",
        action: "Chuẩn bị giá đỡ, trồng cây con, tưới nước",
      },
      {
        stage: "Chăm sóc",
        timing: "Tháng 5-7",
        action: "Bón phân, tưới nước, làm cỏ",
      },
      {
        stage: "Phát triển",
        timing: "Tháng 8-10",
        action: "Cắt tỉa, bón thúc, chăm sóc cành",
      },
      {
        stage: "Ra hoa",
        timing: "Tháng 11-1",
        action: "Tưới nước, phun thuốc kích thích",
      },
      {
        stage: "Đậu quả",
        timing: "Tháng 2-4",
        action: "Bón phân, tưới nước, bao quả",
      },
      {
        stage: "Thu hoạch",
        timing: "Tháng 5-7",
        action: "Thu hoạch khi quả chín, bảo quản mát",
      },
>>>>>>> cuong
    ],
    lightRequirement: "Ánh sáng đầy đủ (8-10 giờ/ngày)",
    waterRequirement: "Tưới 1-2 lần/tuần (chịu hạn tốt)",
  },
};

// Demo soil data
const demoSoils = {
<<<<<<< HEAD
  1: { name: "Đất phù sa", description: "Giàu dinh dưỡng, tơi xốp, thoát nước tốt. pH từ 6.0-7.5, hàm lượng hữu cơ cao, phù hợp trồng cây ăn quả và cây công nghiệp. Độ ẩm trung bình 60-80%, khả năng giữ nước tốt." },
  2: { name: "Đất đỏ bazan", description: "Thích hợp cây công nghiệp dài ngày. Độ pH từ 5.5-6.5, giàu sắt và nhôm, giữ ẩm tốt nhưng cần bổ sung phân hữu cơ. Độ ẩm trung bình 50-70%." },
  3: { name: "Đất cát pha", description: "Cần tưới giữ ẩm thường xuyên. Thoát nước nhanh, dễ làm đất, phù hợp cây ngắn ngày và cây chịu hạn tốt. Độ ẩm trung bình 40-60%." },
=======
  1: {
    name: "Đất phù sa",
    description:
      "Giàu dinh dưỡng, tơi xốp, thoát nước tốt. pH từ 6.0-7.5, hàm lượng hữu cơ cao, phù hợp trồng cây ăn quả và cây công nghiệp. Độ ẩm trung bình 60-80%, khả năng giữ nước tốt.",
  },
  2: {
    name: "Đất đỏ bazan",
    description:
      "Thích hợp cây công nghiệp dài ngày. Độ pH từ 5.5-6.5, giàu sắt và nhôm, giữ ẩm tốt nhưng cần bổ sung phân hữu cơ. Độ ẩm trung bình 50-70%.",
  },
  3: {
    name: "Đất cát pha",
    description:
      "Cần tưới giữ ẩm thường xuyên. Thoát nước nhanh, dễ làm đất, phù hợp cây ngắn ngày và cây chịu hạn tốt. Độ ẩm trung bình 40-60%.",
  },
>>>>>>> cuong
};

// Topographic Pattern SVG Component
function TopographicPattern() {
  return (
    <div className="absolute inset-0 opacity-20">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
<<<<<<< HEAD
          <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
=======
          <pattern
            id="topo"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
>>>>>>> cuong
            <circle cx="50" cy="50" r="2" fill="white" opacity="0.3" />
            <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.2" />
            <circle cx="80" cy="30" r="1.5" fill="white" opacity="0.2" />
            <circle cx="30" cy="80" r="1.5" fill="white" opacity="0.2" />
            <circle cx="70" cy="70" r="1.5" fill="white" opacity="0.2" />
<<<<<<< HEAD
            <path d="M 0 50 Q 25 30, 50 50 T 100 50" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2" />
            <path d="M 0 30 Q 25 50, 50 30 T 100 30" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15" />
            <path d="M 0 70 Q 25 50, 50 70 T 100 70" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15" />
=======
            <path
              d="M 0 50 Q 25 30, 50 50 T 100 50"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
              opacity="0.2"
            />
            <path
              d="M 0 30 Q 25 50, 50 30 T 100 30"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
              opacity="0.15"
            />
            <path
              d="M 0 70 Q 25 50, 50 70 T 100 70"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
              opacity="0.15"
            />
>>>>>>> cuong
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>
    </div>
  );
}

// Stats Card Component
<<<<<<< HEAD
function StatCard({ icon: Icon, label, value, children, className, color = "emerald" }) {
=======
function StatCard({
  icon: Icon,
  label,
  value,
  children,
  className,
  color = "emerald",
}) {
>>>>>>> cuong
  const colorClasses = {
    emerald: "from-emerald-50/95 to-emerald-100/95 backdrop-blur-sm",
    amber: "from-amber-50/95 to-amber-100/95 backdrop-blur-sm",
    sky: "from-sky-50/95 to-sky-100/95 backdrop-blur-sm",
    teal: "from-teal-50/95 to-teal-100/95 backdrop-blur-sm",
  };

  const iconColorClasses = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    teal: "text-teal-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-3 sm:p-4 lg:p-4 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        colorClasses[color],
        className
      )}
    >
      <div className="mb-3 flex flex-col items-center justify-center text-center w-full min-h-[80px]">
<<<<<<< HEAD
        <div className={cn(
          "flex items-center justify-center rounded-xl bg-white/90 shadow-sm backdrop-blur-sm mb-3 flex-shrink-0",
          iconColorClasses[color]
        )} style={{ width: 'clamp(2rem, 3vw + 0.5rem, 2.75rem)', height: 'clamp(2rem, 3vw + 0.5rem, 2.75rem)' }}>
          <Icon style={{ width: 'clamp(1rem, 2vw + 0.25rem, 1.5rem)', height: 'clamp(1rem, 2vw + 0.25rem, 1.5rem)' }} />
        </div>
        <div className="w-full px-2 min-w-0">
          <p className="font-semibold uppercase tracking-wide text-slate-700 break-words" style={{ fontSize: 'clamp(0.625rem, 1.25vw + 0.125rem, 0.9375rem)' }}>
            {label}
          </p>
          {value && (
            <p className="mt-1 font-bold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 1rem)' }}>{value}</p>
=======
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-white/90 shadow-sm backdrop-blur-sm mb-3 flex-shrink-0",
            iconColorClasses[color]
          )}
          style={{
            width: "clamp(2rem, 3vw + 0.5rem, 2.75rem)",
            height: "clamp(2rem, 3vw + 0.5rem, 2.75rem)",
          }}
        >
          <Icon
            style={{
              width: "clamp(1rem, 2vw + 0.25rem, 1.5rem)",
              height: "clamp(1rem, 2vw + 0.25rem, 1.5rem)",
            }}
          />
        </div>
        <div className="w-full px-2 min-w-0">
          <p
            className="font-semibold uppercase tracking-wide text-slate-700 break-words"
            style={{
              fontSize: "clamp(0.625rem, 1.25vw + 0.125rem, 0.9375rem)",
            }}
          >
            {label}
          </p>
          {value && (
            <p
              className="mt-1 font-bold text-slate-900 break-words"
              style={{ fontSize: "clamp(0.75rem, 1.25vw + 0.125rem, 1rem)" }}
            >
              {value}
            </p>
>>>>>>> cuong
          )}
        </div>
      </div>
      {children && <div className="w-full">{children}</div>}
    </motion.div>
  );
}

// Range Progress Bar
function RangeProgressBar({ min, max, unit, label, color = "emerald" }) {
  if (!min || !max) return null;

  const range = max - min;
  const mid = ((min + max) / 2).toFixed(1);

  const colorClasses = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-amber-600",
    sky: "from-sky-400 to-sky-600",
    teal: "from-teal-400 to-teal-600",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span className="font-medium">{label}</span>
<<<<<<< HEAD
        <span className="font-bold text-slate-900 text-[10px]">{mid}{unit}</span>
=======
        <span className="font-bold text-slate-900 text-[10px]">
          {mid}
          {unit}
        </span>
>>>>>>> cuong
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className={cn(
            "h-full bg-gradient-to-r shadow-inner",
            colorClasses[color]
          )}
        />
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-semibold text-white drop-shadow-sm">
<<<<<<< HEAD
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
=======
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
>>>>>>> cuong
        </div>
      </div>
    </div>
  );
}

// Care Guide Step Component
function CareStep({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex gap-4 rounded-xl bg-white/95 backdrop-blur-sm border border-white/20 p-4 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
        {index + 1}
      </div>
<<<<<<< HEAD
      <p className="flex-1 leading-relaxed text-slate-700 break-words" style={{ fontSize: 'clamp(0.8125rem, 1vw + 0.25rem, 0.9375rem)' }}>{step}</p>
=======
      <p
        className="flex-1 leading-relaxed text-slate-700 break-words"
        style={{ fontSize: "clamp(0.8125rem, 1vw + 0.25rem, 0.9375rem)" }}
      >
        {step}
      </p>
>>>>>>> cuong
    </motion.div>
  );
}

// Variety Card Component
function VarietyCard({ variety, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group overflow-hidden rounded-xl border-2 border-emerald-100/50 bg-white/95 backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex gap-4 p-4">
        {variety.imageUrl && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <img
              src={variety.imageUrl}
              alt={variety.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
<<<<<<< HEAD
          <h4 className="mb-1 font-bold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>{variety.name}</h4>
          {variety.description && (
            <p className="text-slate-600 line-clamp-2 break-words" style={{ fontSize: 'clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)' }}>{variety.description}</p>
=======
          <h4
            className="mb-1 font-bold text-slate-900 break-words"
            style={{ fontSize: "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)" }}
          >
            {variety.name}
          </h4>
          {variety.description && (
            <p
              className="text-slate-600 line-clamp-2 break-words"
              style={{ fontSize: "clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)" }}
            >
              {variety.description}
            </p>
>>>>>>> cuong
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Pest Warning Card Component
function PestCard({ pest, index }) {
  const colors = severityColors[pest.severity] || severityColors.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-xl border-2 p-4 transition-all hover:shadow-md",
        colors.bg,
        colors.border
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <Bug className={cn("flex-shrink-0", colors.icon)} style={{ width: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)', height: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)' }} />
          <h4 className="font-bold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>{pest.name}</h4>
=======
          <Bug
            className={cn("flex-shrink-0", colors.icon)}
            style={{
              width: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
              height: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
            }}
          />
          <h4
            className="font-bold text-slate-900 break-words"
            style={{ fontSize: "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)" }}
          >
            {pest.name}
          </h4>
>>>>>>> cuong
        </div>
        <Badge
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            colors.text,
            colors.bg
          )}
        >
<<<<<<< HEAD
          {pest.severity === "High" ? "Cao" : pest.severity === "Medium" ? "Trung bình" : "Thấp"}
        </Badge>
      </div>
      <p className="leading-relaxed text-slate-700 break-words" style={{ fontSize: 'clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)' }}>{pest.description}</p>
=======
          {pest.severity === "High"
            ? "Cao"
            : pest.severity === "Medium"
            ? "Trung bình"
            : "Thấp"}
        </Badge>
      </div>
      <p
        className="leading-relaxed text-slate-700 break-words"
        style={{ fontSize: "clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)" }}
      >
        {pest.description}
      </p>
>>>>>>> cuong
    </motion.div>
  );
}

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [varietyPage, setVarietyPage] = useState(1);
  const VARIETY_PAGE_SIZE = 5;
<<<<<<< HEAD
=======
  const CARE_GUIDE_LIMIT = 7;
  const PEST_LIMIT = 4;
  const VARIETY_LIMIT = 4;
>>>>>>> cuong

  useEffect(() => {
    const fetchPlantDetail = async () => {
      setLoading(true);
      setError(null);
      try {
<<<<<<< HEAD
        const treeTypes = await TreeRepository.getTreeTypes();
        const foundTree = Array.isArray(treeTypes)
          ? treeTypes.find((t) => t.treeTypeId === parseInt(id))
          : null;
=======
        // Try to get tree type detail from API
        const response = await TreeRepository.getTreeTypeById(id);
        const foundTree = response?.data || response;
>>>>>>> cuong

        if (!foundTree) {
          setError("Không tìm thấy loại cây này");
          return;
        }

<<<<<<< HEAD
        // Merge API data with demo data - prioritize backend/DB data
        const demoData = demoPlantData[foundTree.treeTypeId];
=======
        // Helper function to parse JSON fields
        const parseJsonField = (field, defaultValue = []) => {
          if (!field) return defaultValue;
          if (Array.isArray(field)) return field;
          try {
            const parsed =
              typeof field === "string" ? JSON.parse(field) : field;
            return Array.isArray(parsed) ? parsed : defaultValue;
          } catch (e) {
            console.warn(`Failed to parse JSON field:`, e);
            return defaultValue;
          }
        };

        // Get varieties from API
        let varieties = [];
        try {
          const varietiesResponse = await TreeRepository.getTreeVarieties(id);
          if (Array.isArray(varietiesResponse)) {
            varieties = varietiesResponse
              .map((v) => ({
                name: v.varietyName || v.VarietyName || "",
                description: v.varietyDescription || v.VarietyDescription || "",
                imageUrl:
                  v.imageUrl ||
                  v.ImageUrl ||
                  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
              }))
              .filter((v) => v.name); // Only include varieties with names
          }
        } catch (err) {
          console.warn("Failed to fetch varieties:", err);
        }

        // Parse JSON fields from API
        const careGuide = parseJsonField(foundTree.careGuide);
        const pests = parseJsonField(foundTree.pests);
        const seasonalRoadmap = parseJsonField(foundTree.seasonalRoadmap);

        // Merge API data with demo data - prioritize backend/DB data
        const demoData =
          demoPlantData[foundTree.treeTypeId || foundTree.treeTypeID];
>>>>>>> cuong
        const mergedData = {
          ...foundTree,
          // Prioritize backend data, fallback to demo data
          treeTypeName: foundTree.treeTypeName || demoData?.treeTypeName,
          scientificName: foundTree.scientificName || demoData?.scientificName,
          category: foundTree.category || demoData?.category,
          description: foundTree.description || demoData?.description,
          imageUrl: foundTree.imageUrl || demoData?.imageUrl,
<<<<<<< HEAD
          averageLifespanYears: foundTree.averageLifespanYears ?? demoData?.averageLifespanYears,
          optimalTemperatureMin: foundTree.optimalTemperatureMin ?? demoData?.optimalTemperatureMin,
          optimalTemperatureMax: foundTree.optimalTemperatureMax ?? demoData?.optimalTemperatureMax,
          optimalHumidityMin: foundTree.optimalHumidityMin ?? demoData?.optimalHumidityMin,
          optimalHumidityMax: foundTree.optimalHumidityMax ?? demoData?.optimalHumidityMax,
          droughtTolerance: foundTree.droughtTolerance || demoData?.droughtTolerance,
          floodTolerance: foundTree.floodTolerance || demoData?.floodTolerance,
          frostTolerance: foundTree.frostTolerance || demoData?.frostTolerance,
          windTolerance: foundTree.windTolerance || demoData?.windTolerance,
          soilMasterId: foundTree.soilMasterId || demoData?.soilMasterId,
          // Prioritize backend/DB data for arrays and objects
          varieties: foundTree.varieties || foundTree.Varieties || demoData?.varieties || [],
          careGuide: foundTree.careGuide || foundTree.CareGuide || demoData?.careGuide || [],
          pests: foundTree.pests || foundTree.Pests || demoData?.pests || [],
          soilType: foundTree.soilType || demoData?.soilType || "Đất phù sa",
          lightRequirement: foundTree.lightRequirement || demoData?.lightRequirement || "Ánh sáng đầy đủ",
          waterRequirement: foundTree.waterRequirement || demoData?.waterRequirement || "Tưới đều đặn",
=======
          averageLifespanYears:
            foundTree.averageLifespanYears ?? demoData?.averageLifespanYears,
          optimalTemperatureMin:
            foundTree.optimalTemperatureMin ?? demoData?.optimalTemperatureMin,
          optimalTemperatureMax:
            foundTree.optimalTemperatureMax ?? demoData?.optimalTemperatureMax,
          optimalHumidityMin:
            foundTree.optimalHumidityMin ?? demoData?.optimalHumidityMin,
          optimalHumidityMax:
            foundTree.optimalHumidityMax ?? demoData?.optimalHumidityMax,
          droughtTolerance:
            foundTree.droughtTolerance || demoData?.droughtTolerance,
          floodTolerance: foundTree.floodTolerance || demoData?.floodTolerance,
          frostTolerance: foundTree.frostTolerance || demoData?.frostTolerance,
          windTolerance: foundTree.windTolerance || demoData?.windTolerance,
          soilMasterId:
            foundTree.soilMasterId ||
            foundTree.soilMasterID ||
            demoData?.soilMasterId,
          // Use parsed JSON fields from API - no fallback to demo data
          varieties: varieties,
          careGuide: careGuide,
          pests: pests,
          seasonalRoadmap: seasonalRoadmap,
          soilType: foundTree.soilType || demoData?.soilType || "Đất phù sa",
          lightRequirement:
            foundTree.lightRequirement ||
            demoData?.lightRequirement ||
            "Ánh sáng đầy đủ",
          waterRequirement:
            foundTree.waterRequirement ||
            demoData?.waterRequirement ||
            "Tưới đều đặn",
>>>>>>> cuong
        };

        setPlantData(mergedData);
      } catch (err) {
        console.error("Error fetching plant detail:", err);
        setError("Đã xảy ra lỗi khi tải thông tin cây");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlantDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-slate-600 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !plantData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-rose-500" />
<<<<<<< HEAD
          <p className="mb-4 text-base font-semibold text-slate-900">{error || "Không tìm thấy"}</p>
          <Button onClick={() => navigate("/plants")} className="gap-2 rounded-xl">
=======
          <p className="mb-4 text-base font-semibold text-slate-900">
            {error || "Không tìm thấy"}
          </p>
          <Button
            onClick={() => navigate("/plants")}
            className="gap-2 rounded-xl"
          >
>>>>>>> cuong
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const soilInfo = demoSoils[plantData.soilMasterId] || { name: plantData.soilType, description: "Thông tin đất trồng" };

  return (
    <div data-fluid-page className="min-h-screen bg-transparent isolate overflow-x-hidden relative w-full" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
=======
  const soilInfo = demoSoils[plantData.soilMasterId] || {
    name: plantData.soilType,
    description: "Thông tin đất trồng",
  };

  return (
    <div
      data-fluid-page
      className="min-h-screen bg-transparent isolate overflow-x-hidden relative w-full"
      style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
    >
>>>>>>> cuong
      {/* Living Background */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <LivingBackground
          density={28}
          baseColor="#1F302F"
          palette={["#34d399", "#7dd3fc", "#a78bfa"]}
        />
      </div>

      {/* Hero Header with Topographic Pattern */}
      <section className="relative h-[30vh] min-h-[240px] w-full overflow-hidden bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-emerald-900/80 sm:h-[35vh] sm:min-h-[280px] lg:h-[40vh] lg:min-h-[320px]">
        <TopographicPattern />
        <div className="absolute inset-0">
          {plantData.imageUrl && (
            <img
              src={plantData.imageUrl}
              alt={plantData.treeTypeName}
              className="h-full w-full object-cover opacity-15 scale-75"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/70 to-emerald-900/50" />
        </div>

        {/* Back Button */}
        <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/plants")}
            className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-0 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8"
          >
            {plantData.category && (
              <div className="mb-3">
<<<<<<< HEAD
                <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 break-words" style={{ fontSize: 'clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)' }}>
=======
                <Badge
                  className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 break-words"
                  style={{
                    fontSize: "clamp(0.625rem, 1vw + 0.0625rem, 0.75rem)",
                  }}
                >
>>>>>>> cuong
                  {plantData.category}
                </Badge>
              </div>
            )}
<<<<<<< HEAD
            <h1 className="mb-2 font-bold text-white drop-shadow-2xl break-words" style={{ fontSize: 'clamp(1.5rem, 4vw + 0.75rem, 3.5rem)' }}>
              {plantData.treeTypeName}
            </h1>
            {plantData.scientificName && (
              <p className="font-serif italic text-emerald-100 drop-shadow-lg break-words" style={{ fontSize: 'clamp(0.875rem, 1.5vw + 0.375rem, 1.5rem)' }}>
=======
            <h1
              className="mb-2 font-bold text-white drop-shadow-2xl break-words"
              style={{ fontSize: "clamp(1.5rem, 4vw + 0.75rem, 3.5rem)" }}
            >
              {plantData.treeTypeName?.startsWith("Cây ")
                ? plantData.treeTypeName
                : `Cây ${plantData.treeTypeName || ""}`}
            </h1>
            {plantData.scientificName && (
              <p
                className="font-serif italic text-emerald-100 drop-shadow-lg break-words"
                style={{
                  fontSize: "clamp(0.875rem, 1.5vw + 0.375rem, 1.5rem)",
                }}
              >
>>>>>>> cuong
                {plantData.scientificName}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Row - Floating Cards */}
      <section className="relative -mt-12 z-10 w-full px-0">
        <div className="mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Clock}
              label="Tuổi thọ trung bình"
<<<<<<< HEAD
              value={plantData.averageLifespanYears ? `${plantData.averageLifespanYears} năm` : "Không xác định"}
=======
              value={
                plantData.averageLifespanYears
                  ? `${plantData.averageLifespanYears} năm`
                  : "Không xác định"
              }
>>>>>>> cuong
              color="amber"
            />
            <StatCard
              icon={Thermometer}
              label="Nhiệt độ"
              value={`${plantData.optimalTemperatureMin}° - ${plantData.optimalTemperatureMax}°C`}
              color="amber"
            >
              <RangeProgressBar
                min={plantData.optimalTemperatureMin}
                max={plantData.optimalTemperatureMax}
                unit="°C"
                label="Khoảng nhiệt độ"
                color="amber"
              />
            </StatCard>
            <StatCard
              icon={Layers}
              label="Đất trồng"
              value={soilInfo.name}
              color="teal"
            />
            <StatCard
              icon={Droplet}
              label="Độ ẩm"
<<<<<<< HEAD
              value={plantData.optimalHumidityMin && plantData.optimalHumidityMax ? `${plantData.optimalHumidityMin}% - ${plantData.optimalHumidityMax}%` : "Không xác định"}
=======
              value={
                plantData.optimalHumidityMin && plantData.optimalHumidityMax
                  ? `${plantData.optimalHumidityMin}% - ${plantData.optimalHumidityMax}%`
                  : "Không xác định"
              }
>>>>>>> cuong
              color="sky"
            >
              {plantData.optimalHumidityMin && plantData.optimalHumidityMax && (
                <RangeProgressBar
                  min={plantData.optimalHumidityMin}
                  max={plantData.optimalHumidityMax}
                  unit="%"
                  label="Khoảng độ ẩm"
                  color="sky"
                />
              )}
            </StatCard>
          </div>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="relative z-10 w-full px-0 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* Left Column - Main Content (75%) */}
            <div className="col-span-12 xl:col-span-9 space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Description */}
              {plantData.description && (
                <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
<<<<<<< HEAD
                      <div className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0" style={{ width: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)', height: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)' }}>
                        <Info className="text-emerald-600" style={{ width: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)', height: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)' }} />
                      </div>
                      <CardTitle className="break-words flex-1" style={{ fontSize: 'clamp(1rem, 2vw + 0.375rem, 1.5rem)' }}>Mô tả</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-slate-700 whitespace-pre-line break-words" style={{ fontSize: 'clamp(0.875rem, 1.25vw + 0.375rem, 1rem)' }}>
=======
                      <div
                        className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0"
                        style={{
                          width: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                          height: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                        }}
                      >
                        <Info
                          className="text-emerald-600"
                          style={{
                            width: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                            height: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                          }}
                        />
                      </div>
                      <CardTitle
                        className="break-words flex-1"
                        style={{
                          fontSize: "clamp(1rem, 2vw + 0.375rem, 1.5rem)",
                        }}
                      >
                        Mô tả
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="leading-relaxed text-slate-700 whitespace-pre-line break-words"
                      style={{
                        fontSize: "clamp(0.875rem, 1.25vw + 0.375rem, 1rem)",
                      }}
                    >
>>>>>>> cuong
                      {plantData.description}
                    </p>
                  </CardContent>
                </Card>
              )}

<<<<<<< HEAD
              {/* Care Guide */}
              {plantData.careGuide && plantData.careGuide.length > 0 && (
                <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0" style={{ width: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)', height: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)' }}>
                        <Leaf className="text-emerald-600" style={{ width: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)', height: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)' }} />
                      </div>
                      <CardTitle className="break-words flex-1" style={{ fontSize: 'clamp(1rem, 2vw + 0.375rem, 1.5rem)' }}>Hướng dẫn chăm sóc</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Các bước chăm sóc cây trồng đúng cách
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plantData.careGuide.map((step, index) => (
                        <CareStep key={index} step={step} index={index} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Environmental Tolerances */}
              {(plantData.droughtTolerance || plantData.floodTolerance || plantData.frostTolerance || plantData.windTolerance) && (
                <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0" style={{ width: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)', height: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)' }}>
                        <Shield className="text-emerald-600" style={{ width: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)', height: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)' }} />
                      </div>
                      <CardTitle className="break-words flex-1" style={{ fontSize: 'clamp(1rem, 2vw + 0.375rem, 1.5rem)' }}>Khả năng chống chịu</CardTitle>
=======
              {/* Care Guide - Moved below Description */}
              {plantData.careGuide && plantData.careGuide.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0"
                          style={{
                            width: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                            height: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                          }}
                        >
                          <Leaf
                            className="text-emerald-600"
                            style={{
                              width: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                              height: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                            }}
                          />
                        </div>
                        <CardTitle
                          className="break-words flex-1"
                          style={{
                            fontSize: "clamp(1rem, 2vw + 0.375rem, 1.5rem)",
                          }}
                        >
                          Hướng dẫn chăm sóc
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Các bước chăm sóc cây trồng đúng cách
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="space-y-3 overflow-y-auto"
                        style={{
                          maxHeight:
                            plantData.careGuide.length > CARE_GUIDE_LIMIT
                              ? `${CARE_GUIDE_LIMIT * 80}px`
                              : "none",
                        }}
                      >
                        {plantData.careGuide.map((step, index) => (
                          <CareStep key={index} step={step} index={index} />
                        ))}
                      </div>
                      {plantData.careGuide.length > CARE_GUIDE_LIMIT && (
                        <p className="mt-3 text-xs text-slate-500 text-center">
                          Cuộn xuống để xem thêm{" "}
                          {plantData.careGuide.length - CARE_GUIDE_LIMIT} hướng
                          dẫn
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Environmental Tolerances */}
              {(plantData.droughtTolerance ||
                plantData.floodTolerance ||
                plantData.frostTolerance ||
                plantData.windTolerance) && (
                <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0"
                        style={{
                          width: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                          height: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                        }}
                      >
                        <Shield
                          className="text-emerald-600"
                          style={{
                            width: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                            height: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                          }}
                        />
                      </div>
                      <CardTitle
                        className="break-words flex-1"
                        style={{
                          fontSize: "clamp(1rem, 2vw + 0.375rem, 1.5rem)",
                        }}
                      >
                        Khả năng chống chịu
                      </CardTitle>
>>>>>>> cuong
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {plantData.droughtTolerance && (
<<<<<<< HEAD
                        <div className={cn(
                          "rounded-xl border-2 p-4",
                          toleranceColors[plantData.droughtTolerance].bg,
                          toleranceColors[plantData.droughtTolerance].border
                        )}>
                          <div className="mb-2 flex items-center gap-2">
                            <Sun className={cn("flex-shrink-0", toleranceColors[plantData.droughtTolerance].icon)} style={{ width: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)', height: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)' }} />
                            <span className="font-semibold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>Khả năng hạn</span>
                          </div>
                          <Badge className={cn(
                            "rounded-full",
                            toleranceColors[plantData.droughtTolerance].text,
                            toleranceColors[plantData.droughtTolerance].bg
                          )}>
=======
                        <div
                          className={cn(
                            "rounded-xl border-2 p-4",
                            toleranceColors[plantData.droughtTolerance].bg,
                            toleranceColors[plantData.droughtTolerance].border
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Sun
                              className={cn(
                                "flex-shrink-0",
                                toleranceColors[plantData.droughtTolerance].icon
                              )}
                              style={{
                                width: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                                height: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                              }}
                            />
                            <span
                              className="font-semibold text-slate-900 break-words"
                              style={{
                                fontSize:
                                  "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)",
                              }}
                            >
                              Khả năng hạn
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full",
                              toleranceColors[plantData.droughtTolerance].text,
                              toleranceColors[plantData.droughtTolerance].bg
                            )}
                          >
>>>>>>> cuong
                            {toleranceLabels[plantData.droughtTolerance]}
                          </Badge>
                        </div>
                      )}
                      {plantData.floodTolerance && (
<<<<<<< HEAD
                        <div className={cn(
                          "rounded-xl border-2 p-4",
                          toleranceColors[plantData.floodTolerance].bg,
                          toleranceColors[plantData.floodTolerance].border
                        )}>
                          <div className="mb-2 flex items-center gap-2">
                            <Waves className={cn("flex-shrink-0", toleranceColors[plantData.floodTolerance].icon)} style={{ width: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)', height: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)' }} />
                            <span className="font-semibold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>Khả năng ngập</span>
                          </div>
                          <Badge className={cn(
                            "rounded-full",
                            toleranceColors[plantData.floodTolerance].text,
                            toleranceColors[plantData.floodTolerance].bg
                          )}>
=======
                        <div
                          className={cn(
                            "rounded-xl border-2 p-4",
                            toleranceColors[plantData.floodTolerance].bg,
                            toleranceColors[plantData.floodTolerance].border
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Waves
                              className={cn(
                                "flex-shrink-0",
                                toleranceColors[plantData.floodTolerance].icon
                              )}
                              style={{
                                width: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                                height: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                              }}
                            />
                            <span
                              className="font-semibold text-slate-900 break-words"
                              style={{
                                fontSize:
                                  "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)",
                              }}
                            >
                              Khả năng ngập
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full",
                              toleranceColors[plantData.floodTolerance].text,
                              toleranceColors[plantData.floodTolerance].bg
                            )}
                          >
>>>>>>> cuong
                            {toleranceLabels[plantData.floodTolerance]}
                          </Badge>
                        </div>
                      )}
                      {plantData.frostTolerance && (
<<<<<<< HEAD
                        <div className={cn(
                          "rounded-xl border-2 p-4",
                          toleranceColors[plantData.frostTolerance].bg,
                          toleranceColors[plantData.frostTolerance].border
                        )}>
                          <div className="mb-2 flex items-center gap-2">
                            <Snowflake className={cn("flex-shrink-0", toleranceColors[plantData.frostTolerance].icon)} style={{ width: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)', height: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)' }} />
                            <span className="font-semibold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>Khả năng sương giá</span>
                          </div>
                          <Badge className={cn(
                            "rounded-full",
                            toleranceColors[plantData.frostTolerance].text,
                            toleranceColors[plantData.frostTolerance].bg
                          )}>
=======
                        <div
                          className={cn(
                            "rounded-xl border-2 p-4",
                            toleranceColors[plantData.frostTolerance].bg,
                            toleranceColors[plantData.frostTolerance].border
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Snowflake
                              className={cn(
                                "flex-shrink-0",
                                toleranceColors[plantData.frostTolerance].icon
                              )}
                              style={{
                                width: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                                height: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                              }}
                            />
                            <span
                              className="font-semibold text-slate-900 break-words"
                              style={{
                                fontSize:
                                  "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)",
                              }}
                            >
                              Khả năng sương giá
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full",
                              toleranceColors[plantData.frostTolerance].text,
                              toleranceColors[plantData.frostTolerance].bg
                            )}
                          >
>>>>>>> cuong
                            {toleranceLabels[plantData.frostTolerance]}
                          </Badge>
                        </div>
                      )}
                      {plantData.windTolerance && (
<<<<<<< HEAD
                        <div className={cn(
                          "rounded-xl border-2 p-4",
                          toleranceColors[plantData.windTolerance].bg,
                          toleranceColors[plantData.windTolerance].border
                        )}>
                          <div className="mb-2 flex items-center gap-2">
                            <Wind className={cn("flex-shrink-0", toleranceColors[plantData.windTolerance].icon)} style={{ width: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)', height: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)' }} />
                            <span className="font-semibold text-slate-900 break-words" style={{ fontSize: 'clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)' }}>Khả năng gió mạnh</span>
                          </div>
                          <Badge className={cn(
                            "rounded-full",
                            toleranceColors[plantData.windTolerance].text,
                            toleranceColors[plantData.windTolerance].bg
                          )}>
=======
                        <div
                          className={cn(
                            "rounded-xl border-2 p-4",
                            toleranceColors[plantData.windTolerance].bg,
                            toleranceColors[plantData.windTolerance].border
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Wind
                              className={cn(
                                "flex-shrink-0",
                                toleranceColors[plantData.windTolerance].icon
                              )}
                              style={{
                                width: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                                height: "clamp(1rem, 1.5vw + 0.25rem, 1.25rem)",
                              }}
                            />
                            <span
                              className="font-semibold text-slate-900 break-words"
                              style={{
                                fontSize:
                                  "clamp(0.75rem, 1.25vw + 0.125rem, 0.9375rem)",
                              }}
                            >
                              Khả năng gió mạnh
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full",
                              toleranceColors[plantData.windTolerance].text,
                              toleranceColors[plantData.windTolerance].bg
                            )}
                          >
>>>>>>> cuong
                            {toleranceLabels[plantData.windTolerance]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sticky Sidebar (25%) */}
            <div className="col-span-12 xl:col-span-3 space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Varieties List */}
<<<<<<< HEAD
              {plantData.varieties && plantData.varieties.length > 0 && (() => {
                const totalVarieties = plantData.varieties.length;
                const totalPages = Math.ceil(totalVarieties / VARIETY_PAGE_SIZE);
                const startIndex = (varietyPage - 1) * VARIETY_PAGE_SIZE;
                const paginatedVarieties = plantData.varieties.slice(startIndex, startIndex + VARIETY_PAGE_SIZE);
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="sticky top-6 z-10"
                  >
                    <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0" style={{ width: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)', height: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)' }}>
                              <Sprout className="text-emerald-600" style={{ width: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)', height: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)' }} />
                            </div>
                            <CardTitle className="break-words flex-1" style={{ fontSize: 'clamp(0.875rem, 1.5vw + 0.125rem, 1.25rem)' }}>Các loại giống phổ biến</CardTitle>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            {totalVarieties} giống
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {paginatedVarieties.map((variety, index) => (
                            <VarietyCard key={index} variety={variety} index={startIndex + index} />
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVarietyPage(prev => Math.max(1, prev - 1))}
                              disabled={varietyPage === 1}
                              className="text-[10px]"
                            >
                              Trước
                            </Button>
                            <span className="text-[10px] text-slate-600">
                              Trang {varietyPage}/{totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVarietyPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={varietyPage === totalPages}
                              className="text-[10px]"
                            >
                              Sau
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}

              {/* Pest Warnings */}
              {plantData.pests && plantData.pests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-6 z-10"
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center rounded-xl bg-red-100 flex-shrink-0" style={{ width: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)', height: 'clamp(2.5rem, 4vw + 0.5rem, 3.5rem)' }}>
                          <AlertTriangle className="text-red-600" style={{ width: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)', height: 'clamp(1.25rem, 2vw + 0.25rem, 1.75rem)' }} />
                        </div>
                        <CardTitle className="break-words flex-1" style={{ fontSize: 'clamp(1rem, 2vw + 0.375rem, 1.5rem)' }}>Bệnh thường gặp</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {plantData.pests.map((pest, index) => (
                          <PestCard key={index} pest={pest} index={index} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

=======
              {plantData.varieties &&
                plantData.varieties.length > 0 &&
                (() => {
                  const totalVarieties = plantData.varieties.length;
                  const hasMoreVarieties = totalVarieties > VARIETY_LIMIT;
                  const displayedVarieties = plantData.varieties.slice(
                    0,
                    VARIETY_LIMIT
                  );

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="sticky top-6 z-10"
                    >
                      <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div
                                className="flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0"
                                style={{
                                  width: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                                  height: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                                }}
                              >
                                <Sprout
                                  className="text-emerald-600"
                                  style={{
                                    width:
                                      "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                                    height:
                                      "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                                  }}
                                />
                              </div>
                              <CardTitle
                                className="break-words flex-1"
                                style={{
                                  fontSize:
                                    "clamp(0.875rem, 1.5vw + 0.125rem, 1.25rem)",
                                }}
                              >
                                Các loại giống phổ biến
                              </CardTitle>
                            </div>
                            <CardTitle
                              className="break-words flex-1"
                              style={{
                                fontSize:
                                  "clamp(0.875rem, 1.5vw + 0.125rem, 1.25rem)",
                              }}
                            >
                              Các loại giống phổ biến
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="space-y-3 overflow-y-auto"
                            style={{
                              maxHeight: hasMoreVarieties
                                ? `${VARIETY_LIMIT * 100}px`
                                : "none",
                            }}
                          >
                            {displayedVarieties.map((variety, index) => (
                              <VarietyCard
                                key={index}
                                variety={variety}
                                index={index}
                              />
                            ))}
                          </div>
                          {hasMoreVarieties && (
                            <p className="mt-3 text-xs text-slate-500 text-center">
                              Cuộn xuống để xem thêm{" "}
                              {totalVarieties - VARIETY_LIMIT} giống
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })()}

              {/* Pest Warnings */}
              {plantData.pests &&
                plantData.pests.length > 0 &&
                (() => {
                  const totalPests = plantData.pests.length;
                  const hasMorePests = totalPests > PEST_LIMIT;
                  const displayedPests = plantData.pests.slice(0, PEST_LIMIT);

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="sticky top-6 z-10"
                    >
                      <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div
                                className="flex items-center justify-center rounded-xl bg-red-100 flex-shrink-0"
                                style={{
                                  width: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                                  height: "clamp(2.5rem, 4vw + 0.5rem, 3.5rem)",
                                }}
                              >
                                <AlertTriangle
                                  className="text-red-600"
                                  style={{
                                    width:
                                      "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                                    height:
                                      "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)",
                                  }}
                                />
                              </div>
                              <CardTitle
                                className="break-words flex-1"
                                style={{
                                  fontSize:
                                    "clamp(1rem, 2vw + 0.375rem, 1.5rem)",
                                }}
                              >
                                Bệnh thường gặp
                              </CardTitle>
                            </div>
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {totalPests} bệnh
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="space-y-3 overflow-y-auto"
                            style={{
                              maxHeight: hasMorePests
                                ? `${PEST_LIMIT * 140}px`
                                : "none",
                            }}
                          >
                            {displayedPests.map((pest, index) => (
                              <PestCard key={index} pest={pest} index={index} />
                            ))}
                          </div>
                          {hasMorePests && (
                            <p className="mt-3 text-xs text-slate-500 text-center">
                              Cuộn xuống để xem thêm {totalPests - PEST_LIMIT}{" "}
                              bệnh
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })()}
>>>>>>> cuong
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
