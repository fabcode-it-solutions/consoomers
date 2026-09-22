import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
type T = {
    totalPages: number, currentPage: number, totalItems: number, itemsPerPage: number, hasPrev: boolean, hasNext: boolean, setCurrentPage: (v: number) => void
}
const Pagination = ({ totalPages, currentPage, totalItems, setCurrentPage, hasPrev, hasNext, itemsPerPage }: T) => {
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    return (
        totalPages > 1 && (
            <div className="flex items-center justify-between bg-dark-100 border-[#334155] p-4">
                <div className="text-sm text-[#BDBDBD] font-sofia-sans">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} results
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrev}
                        className="px-3 py-1 border border-[#334155] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-5/10 text-[#BDBDBD] font-sofia-sans"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm text-[#BDBDBD] font-sofia-sans">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1 border border-[#334155] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-5/10 text-[#BDBDBD] font-sofia-sans"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    )
}

export default Pagination
