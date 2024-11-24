"use client"
import { toast } from 'react-toastify';
import { useEffect, useState } from "react"
import { Search, Trash2, BookCopy, Eye,  Plus, RefreshCcwDot,Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
// import { useRouter } from "next/navigation"
export default function BlogContent() {
  const [area, setArea] = useState([])
  const [error, setError] = useState([])
  const router = useRouter(); // Khởi tạo router
  // const router = useRouter()
  // Định nghĩa hàm fetchData
  const fetchDataArea = async () => {
    
    try {
        const adminToken = Cookies.get("token");
        const response = await fetch('http://localhost:8000/api/khu-vuc/', {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
          });
      if (response.ok) {
        const result = await response.json();
        setArea(result);
      } else {
        setError('Không có quyền truy cập');
      }
    } catch (error) {
      setError('Không thể truy cập dữ liệu');
    }
  }
  // Gọi fetchData trong useEffect khi trang load lần đầu
  useEffect(() => {
    const adminToken = Cookies.get('token');
    if (!adminToken) {
      router.push('/');
      return;
    }
    fetchDataArea();
    // Call the prop to expose fetchData
  }, [router]);
 
 // Delete Blog
 const handleDeleteArea = async (id) => {
    const adminToken = Cookies.get("token");
    try {
      const response = await fetch(`http://localhost:8000/api/khu-vuc/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log('Delete response status:', response.status);
      if (response.ok) {
        // Cập nhật danh sách người dùng bằng cách loại bỏ người dùng đã xóa
        setArea((prevArea) => prevArea.filter(areas => areas.id !== id));
        const shouldGoToRecovery = window.confirm("Xóa blog thành công! Bạn có muốn đến trang khôi phục không?");
        if (shouldGoToRecovery) {
          router.push("/admin/area/refesh_area"); // Chuyển đến trang khôi phục
        } else {
            fetchDataArea(); // Cập nhật danh sách người dùng nếu không chuyển trang
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Lỗi khi xóa blog");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Có lỗi xảy ra khi xóa blog");
    }
  };
   // nhân bản Area
   const handleCoppyArea = async (id) => {
    const adminToken = Cookies.get("token");
    try {
      const response = await fetch(`http://localhost:8000/api/khu-vuc/duplicate/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const newArea = await response.json();
        setArea((prevArea) => [...prevArea, newArea]); // Cập nhật danh sách user
        // Hiện thông báo và tải lại danh sách users
        fetchDataArea(); // Gọi lại fetchData để tải lại danh sách user mới

      } else {
        const errorData = await response.json();
        setError(errorData.message || "Lỗi lấy thông tin phản hồi");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Có lỗi xảy ra khi sao chép người dùng");
    }
  };
  const handleToggle = async (id, isHot) => {
    const adminToken = Cookies.get("token");
    try {
      const response = await fetch(`http://localhost:8000/api/khu-vuc/editHot/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hot: !isHot }), // Toggle trạng thái hot
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Cập nhật thành công');
        setArea(prevArea =>
          prevArea.map(area =>
            area.id === id ? { ...area, hot: !isHot } : area
          )
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Lỗi khi cập nhật');
      }
    } catch (error) {
      toast.error('Lỗi khi gửi yêu cầu');
    }
  };


  const handleRefeshArea = () => {
    router.push('/admin/area/refesh_area')
  }
  const handleDetailArea = (id) => {
    router.push(`/admin/area/detail_area/${id}`)
  }
  const handleCreatArea = () => {
    router.push('/admin/area/create_area')
  }
  const handleUpdateArea = (id) => {
    router.push(`/admin/area/update_area/${id}`)
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Cột input */}
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={""}
            // onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
        {/* Cột buttons */}
        <div className="flex justify-end space-x-2">
          <Button onClick={handleCreatArea}  className="bg-green-700 text-white hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            create Area
          </Button>
          <Button onClick={handleRefeshArea} variant="blue">
            <RefreshCcwDot className="mr-2 h-4 w-4" />
            Refresh Contract
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {area.map((areas, index) => (
            <TableRow key={index} >
              <TableCell>{areas.id}</TableCell>
              <TableCell> <img style={{height:"150px", width:'250px', objectFit:"cover", borderRadius:"10px"}} src={`http://localhost:8000/storage/${areas.image}`}></img> </TableCell>
              <TableCell>{areas.name} </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{areas.hot ? "On" : "Off"}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={areas.hot}
                      onChange={() => handleToggle(areas.id, areas.hot)}
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-700 peer-focus:ring-4 peer-focus:ring-blue-300 transition-all"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border rounded-full border-gray-300 peer-checked:translate-x-5 peer-checked:border-white transition-all"></div>
                  </label>
                </div>
              </TableCell>
       
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleDeleteArea(areas.id)} >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleUpdateArea(areas.id)}  >
                    <Pen className="h-4 w-4"
                    />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleCoppyArea(areas.id)}  >
                    <BookCopy className="h-4 w-4"
                    />
                  </Button>
                  <Button variant="outline" size="icon"   onClick={() => handleDetailArea(areas.id)}>
                    <Eye className="h-4 w-4"
                    />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}