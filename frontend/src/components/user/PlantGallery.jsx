import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Thermometer,
  Droplets,
  Leaf,
  Sparkles,
  CornerDownRight,
  CornerUpLeft,
  Trees,
  Sprout,
  Flower2,
  Flower,
  Info,
} from "lucide-react";
import TreeRepository from "@/API/repositories/TreeRepository";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LivingBackground } from "@/components/background";


function PlantCard({ tree, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
      }}
      onClick={onClick}
      className="group relative h-full w-full cursor-pointer overflow-visible rounded-2xl transition-all duration-500"
    >
      {/* Glowing green border wrapper on hover */}
      <div className="absolute -inset-[3px] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <motion.div
          className="h-full w-full rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3), 0 0 45px rgba(34, 197, 94, 0.2), inset 0 0 15px rgba(34, 197, 94, 0.1)",
              "0 0 25px rgba(34, 197, 94, 0.8), 0 0 50px rgba(34, 197, 94, 0.5), 0 0 75px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.2)",
              "0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3), 0 0 45px rgba(34, 197, 94, 0.2), inset 0 0 15px rgba(34, 197, 94, 0.1)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-full w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 p-[3px]">
            <div className="h-full w-full rounded-2xl bg-white/80 backdrop-blur-xl" />
          </div>
        </motion.div>
      </div>

      {/* Card content wrapper */}
      <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-black/5 transition-all duration-500 group-hover:shadow-xl">
        {/* Animated corner accents */}
        <div className="absolute -top-1 -left-1 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <motion.div
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CornerUpLeft className="h-6 w-6 text-emerald-500 drop-shadow-lg" />
          </motion.div>
        </div>
        <div className="absolute -bottom-1 -right-1 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <motion.div
            animate={{ rotate: [0, -90, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CornerDownRight className="h-6 w-6 text-emerald-500 drop-shadow-lg" />
          </motion.div>
        </div>

        {/* Pulsing glow rings */}
        <div className="absolute -inset-4 -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-emerald-500/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        {/* Image Section with modern effects */}
        <div className="relative h-[320px] w-full overflow-hidden rounded-t-2xl sm:h-[360px] md:h-[380px] lg:h-[400px] flex items-center justify-center bg-white/5">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <img
            src={
              tree.imageUrl ||
              "https://images.unsplash.com/photo-1437750769465-301382cdf094?w=400"
            }
            alt={tree.treeTypeName}
            // use object-contain so images keep their aspect ratio and aren't distorted
            className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Animated overlay gradient with emerald tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          />

          {/* Floating particles effect with emerald theme */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <motion.div
              className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-400/80 shadow-lg shadow-emerald-400/50"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-12 right-8 h-1.5 w-1.5 rounded-full bg-green-400/80 shadow-lg shadow-green-400/50"
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
            <motion.div
              className="absolute top-20 right-6 h-1 w-1 rounded-full bg-emerald-500/80 shadow-lg shadow-emerald-500/50"
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
        </div>

        {/* Content Section - Modern and clean */}
        <div className="relative z-10 flex min-h-[140px] flex-col justify-center space-y-2 bg-gradient-to-b from-white/95 to-white p-4 sm:p-5">
          {/* Tree Name with gradient text effect */}
          <h3 className="line-clamp-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-lg font-bold text-transparent transition-all duration-300 group-hover:from-emerald-700 group-hover:via-emerald-600 group-hover:to-emerald-700 sm:text-xl md:text-2xl">
            {tree.treeTypeName?.startsWith("Cây ")
              ? tree.treeTypeName
              : `Cây ${tree.treeTypeName || ""}`}
          </h3>

          {/* Average Lifespan */}
          {tree.averageLifespanYears && (
            <motion.p
              className="text-sm font-medium text-emerald-600/80 sm:text-base"
              whileHover={{ x: 2 }}
            >
              Tuổi thọ trung bình: {tree.averageLifespanYears} năm
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PlantGallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Show 4 items per row, 10 rows per page = 40 items per page
  const itemsPerPage = 4 * 10; // 40 items per page

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const treeTypesResponse = await TreeRepository.getTreeTypes();
        const treeTypes = Array.isArray(treeTypesResponse)
          ? treeTypesResponse
          : [];

        // Map tree types from API response to component format
        const treesFromDatabase = treeTypes
          .filter((tree) => tree.isActive !== false) // Only active trees
          .map((tree) => ({
            treeTypeId: tree.treeTypeId,
            treeTypeName: tree.treeTypeName,
            scientificName: tree.scientificName,
            category: tree.category,
            soilMasterId: tree.soilMasterId,
            isActive: tree.isActive,
            // These fields might not be in current DTO, but we'll handle gracefully
            description: tree.description || null,
            imageUrl:
              tree.imageUrl ||
              "https://images.unsplash.com/photo-1437750769465-301382cdf094?w=400", // Default fallback image
            optimalTemperatureMin: tree.optimalTemperatureMin || null,
            optimalTemperatureMax: tree.optimalTemperatureMax || null,
            optimalHumidityMin: tree.optimalHumidityMin || null,
            optimalHumidityMax: tree.optimalHumidityMax || null,
            droughtTolerance: tree.droughtTolerance || null,
            floodTolerance: tree.floodTolerance || null,
            frostTolerance: tree.frostTolerance || null,
            windTolerance: tree.windTolerance || null,
            averageLifespanYears: tree.averageLifespanYears || null,
            // New fields from database
            careGuide: tree.careGuide || null,
            lightRequirement: tree.lightRequirement || null,
            waterRequirement: tree.waterRequirement || null,
            pests: tree.pests || null,
            seasonalRoadmap: tree.seasonalRoadmap || null,
          }));

        setTrees(treesFromDatabase);
      } catch (error) {
        console.error("Error fetching tree types:", error);
        // On error, set empty array instead of mock data
        setTrees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.key]); // Thêm location.key để force reload khi navigate (back/forward)

  const filteredTrees = useMemo(() => {
    if (!searchQuery.trim()) return trees;

    const query = searchQuery.toLowerCase().trim();
    return trees.filter(
      (tree) =>
        tree.treeTypeName.toLowerCase().includes(query) ||
        tree.scientificName?.toLowerCase().includes(query) ||
        tree.description?.toLowerCase().includes(query) ||
        tree.category?.toLowerCase().includes(query)
    );
  }, [trees, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTrees.length / itemsPerPage);
  const paginatedTrees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrees, currentPage, itemsPerPage]);

  // Calculate items in first row for centering (4 columns on lg screens)
  // Only center if first row has less than 4 items
  const firstRowItems = useMemo(() => {
    return Math.min(paginatedTrees.length, 4);
  }, [paginatedTrees.length]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleViewDetails = (treeTypeId) => {
    navigate(`/plants/${treeTypeId}`);
  };

  return (
    <div className="min-h-screen bg-transparent isolate overflow-x-hidden relative w-full">
      {/* Living Background */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <LivingBackground
          density={28}
          baseColor="#1F302F"
          palette={["#34d399", "#7dd3fc", "#a78bfa"]}
        />
      </div>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden">
        {/* Content - Compact Hero */}
        <div className="relative z-10 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-full border border-white/20 bg-white/10 px-6 py-8 backdrop-blur-xl shadow-2xl sm:px-8 sm:py-10 lg:px-12 lg:py-12 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/30"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white sm:text-sm">
                Khám phá thế giới cây trồng
              </span>
            </motion.div>

            {/* Main Title - More compact */}
            <motion.h1
              className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="block text-white drop-shadow-2xl [text-shadow:_0_2px_20px_rgba(255,255,255,0.9),_0_4px_40px_rgba(34,197,94,0.5)]">
                Thư viện Cây ăn quả
              </span>
            </motion.h1>

            {/* Subtitle - More compact */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 text-base text-white/90 sm:text-lg lg:text-xl"
            >
              Khám phá hàng trăm loại cây trồng với thông tin chi tiết và hướng
              dẫn chăm sóc
            </motion.p>

            {/* Search Bar - More compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto max-w-2xl"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-25 blur-xl" />

                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <Search className="h-5 w-5 text-emerald-600/70" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Tìm kiếm loại cây, tên khoa học, hoặc mô tả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 rounded-2xl border-0 bg-white/98 pl-14 pr-6 text-base shadow-xl backdrop-blur-xl ring-2 ring-white/60 transition-all duration-300 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-emerald-400/50 focus-visible:shadow-emerald-500/20"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ✕
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Quick stats - More compact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-white/80 sm:text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5" />
                  <span>{filteredTrees.length} loại cây</span>
                </div>
                <div className="h-3 w-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  <span>Thông tin chi tiết</span>
                </div>
                <div className="h-3 w-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5" />
                  <span>Hướng dẫn chăm sóc</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plant Grid Section - Full width with natural decorative elements */}
      <section className="relative z-10 w-full bg-transparent pt-6 pb-12 sm:pt-8 lg:pt-10">
        <div className="w-full">
          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="relative h-16 w-16"
              >
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-teal-600" />
              </motion.div>
            </div>
          ) : filteredTrees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[500px] flex-col items-center justify-center gap-6 text-center"
            >
              <div className="relative">
                <Leaf className="h-20 w-20 text-slate-300" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-xl font-medium text-slate-600">
                {searchQuery
                  ? "Không tìm thấy loại cây phù hợp với từ khoá của bạn."
                  : "Chưa có loại cây nào trong hệ thống."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Dynamic styles for centering first row - only when < 4 items on lg screens */}
              {firstRowItems > 0 && firstRowItems < 4 && (
                <style>{`
                  @media (min-width: 1024px) {
                    ${Array.from({ length: firstRowItems }, (_, i) => {
                  // Calculate starting column to center the items for 4 columns:
                  // startCol = Math.floor((columns - n) / 2) + 1 + i
                  const columns = 4;
                  const baseCol =
                    Math.floor((columns - firstRowItems) / 2) + 1;
                  const startCol = baseCol + i;
                  return `.plant-grid-item-first-row-${firstRowItems}-${i} {
                        grid-column-start: ${startCol} !important;
                      }`;
                }).join("\n")}
                  }
                `}</style>
              )}

              {/* Grid: 4 columns on large screens for vertical portrait cards */}
              <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-8 sm:gap-y-14 md:gap-x-10 md:gap-y-18 lg:gap-x-12 lg:gap-y-24 sm:px-3">
                <AnimatePresence mode="wait">
                  {paginatedTrees.map((tree, index) => {
                    const isFirstRow = index < 4;
                    const shouldCenter =
                      firstRowItems > 0 && firstRowItems < 4 && isFirstRow;
                    const itemIndexInFirstRow = shouldCenter ? index : -1;

                    return (
                      <div
                        key={tree.treeTypeId}
                        className={cn(
                          shouldCenter &&
                          `plant-grid-item-first-row-${firstRowItems}-${itemIndexInFirstRow}`
                        )}
                      >
                        <PlantCard
                          tree={tree}
                          index={index}
                          onClick={() => handleViewDetails(tree.treeTypeId)}
                        />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-20 flex items-center justify-center gap-4"
                >
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
                  >
                    Trước
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <motion.div
                          key={page}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "h-11 w-11 rounded-xl border-2 font-semibold transition-all",
                              currentPage === page
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400/50 hover:from-emerald-700 hover:to-teal-700"
                                : "bg-white/80 backdrop-blur-sm hover:bg-emerald-50 hover:border-emerald-300"
                            )}
                          >
                            {page}
                          </Button>
                        </motion.div>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
                  >
                    Sau
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
