"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import dynamic from "next/dynamic";
// Import React Quill với tính năng hỗ trợ đầy đủ công cụ
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import 
// Cấu hình toolbar cho Quill với đầy đủ công cụ
const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }], // Các cấp độ tiêu đề và font
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Danh sách có thứ tự và không có thứ tự
        ['bold', 'italic', 'underline', 'strike'], // In đậm, in nghiêng, gạch dưới, gạch ngang
        [{ 'align': [] }], // Căn chỉnh
        [{ 'color': [] }, { 'background': [] }], // Chọn màu chữ và nền
        [{ 'script': 'sub' }, { 'script': 'super' }], // Chỉ số trên, chỉ số dưới
        ['link', 'image'], // Thêm link và ảnh
        ['blockquote', 'code-block'], // Trích dẫn và khối mã
        ['clean'], // Xóa định dạng
    ],
};
export default function CreateBanner() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [order, setOrder] = useState("");
    const [image, setImage] = useState(null); // Giữ nguyên file ảnh thay vì mã hóa
    const [preview, setPreview] = useState(null); // URL ảnh xem trước
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Cập nhật hàm handleImageChange để lưu file thay vì mã hóa base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Lưu file ảnh
            setPreview(URL.createObjectURL(file)); // Tạo URL xem trước
        } else {
            setImage(null);
            setPreview(null);
        }
    };

    // Hàm submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const adminToken = Cookies.get("token");
        if (!adminToken) {
            toast.error("vui lòng đăng nhập trước khi tạo khu vực !"); // Thông báo lỗi    
            router.push("/");
            return;
        }

        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        // Sử dụng FormData để gửi file ảnh
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("order", order);
        if (image) {
            formData.append("image", image); // Đính kèm file ảnh
        }

        try {
            const adminToken = Cookies.get("token");
            const response = await fetch("http://localhost:8000/api/banner/add", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${adminToken}`,
                },
                body: formData, // Gửi FormData thay vì JSON
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                toast.success("Biểu ngữ đã được tạo thành công!");
            } else {
                toast.warning(data.message);
            }
        } catch (error) {
            toast.error(data.message || "Không thể kết nối đến server, vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    const handleRefesh = () => {
        router.push('/admin/banners');
    }

    return (
        <>
            <div className="flex justify-end p-6">
                <Button onClick={handleRefesh} className="bg-blue-900 text-white hover:bg-blue-600">
                    <FileText className="mr-2 h-4 w-4" />
                    Trang biểu ngữ
                </Button>
            </div>
            <div className=" flex items-center justify-center bg-gray-100 p-6">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-screen-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tạo biểu ngữ mới</h2>

                    {successMessage && (
                        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600">Tiêu đề</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Nhập tiêu đề"

                            />
                        </div>
                        <div>
                            <label className="block text-gray-600">Thứ tự</label>
                            <input
                                type="number"
                                step={2}
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Nhập thứ tự"

                            />
                        </div>
                        <div>
                            <label className="block text-gray-600">Nội dung</label>
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                modules={modules} // Sử dụng cấu hình module với toolbar đầy đủ
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Nhập nội dung bài viết"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600">Ảnh</label>
                            <input
                                type="file"
                                onChange={handleImageChange}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                accept="image/*"
                            />
                            {preview && (
                                <div className="mt-4">
                                    <img
                                        src={preview}
                                        alt="Xem trước ảnh"
                                        className="w-40 h-40 object-cover rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded ${loading ? "bg-gray-400" : "bg-blue-900 hover:bg-blue-700"} text-white transition`}
                        >
                            {loading ? "Đang tạo..." : "Thêm biểu ngữ"}
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}
