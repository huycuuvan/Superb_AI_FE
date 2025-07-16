import React, { useEffect, useState } from "react";
import { getAllGiftcodes, createGiftcode, updateGiftcode, deleteGiftcode, Giftcode } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import GiftcodeForm from "@/components/GiftcodeForm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Search, Edit, Trash2, Gift } from "lucide-react";

const GiftcodesPage: React.FC = () => {
  const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editingGiftcode, setEditingGiftcode] = useState<Giftcode | null>(null);
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [giftcodeToDelete, setGiftcodeToDelete] = useState<Giftcode | null>(null);

  const fetchGiftcodes = async () => {
    setLoading(true);
    try {
      const res = await getAllGiftcodes();
      setGiftcodes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // TODO: handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftcodes();
  }, []);

  const handleCreate = () => {
    setEditingGiftcode(null);
    setOpenForm(true);
  };

  const handleEdit = (giftcode: Giftcode) => {
    setEditingGiftcode(giftcode);
    setOpenForm(true);
  };

  const handleDelete = (giftcode: Giftcode) => {
    setGiftcodeToDelete(giftcode);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (giftcodeToDelete) {
      await deleteGiftcode(giftcodeToDelete.code);
      setShowDeleteDialog(false);
      setGiftcodeToDelete(null);
      fetchGiftcodes();
    }
  };

  // Lọc giftcode theo search
  const filteredGiftcodes = (giftcodes || []).filter(g =>
    g.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white/10 dark:bg-slate-900/60 overflow-hidden">
        <CardHeader className="bg-white/10 dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-2xl text-white"><Gift className="h-6 w-6 text-pink-400" /> Quản lý Giftcode</CardTitle>
            <CardDescription className="text-slate-300">Tạo, sửa, xoá và tìm kiếm giftcode cho hệ thống.</CardDescription>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giftcode..."
                className="pl-8 w-full sm:w-[180px] md:w-[240px] border-border bg-background text-foreground placeholder:text-muted-foreground"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} className="whitespace-nowrap">Tạo giftcode mới</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20">
              <TableRow>
                <TableHead className="w-[180px]">Giftcode</TableHead>
                <TableHead className="text-center">Credit</TableHead>
                <TableHead className="text-center">Ngày hết hạn</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiftcodes.length > 0 ? (
                filteredGiftcodes.map((g) => (
                  <TableRow key={g.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/20 transition-colors duration-200">
                    <TableCell className="font-semibold text-primary dark:text-slate-200 ">{g.code}</TableCell>
                    <TableCell className="text-center text-primary dark:text-slate-200   ">{g.credit}</TableCell>
                    <TableCell className="text-center text-primary dark:text-slate-200   ">{g.expired_at ? new Date(g.expired_at).toLocaleString() : ""}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => handleEdit(g)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-red-100 dark:hover:bg-red-900 ml-1" onClick={() => handleDelete(g)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Gift className="w-12 h-12 mb-2 text-pink-400 opacity-60" />
                      <p className="text-sm text-muted-foreground">Không có giftcode nào</p>
                      {search && (
                        <Button variant="link" onClick={() => setSearch("")}>Xoá tìm kiếm</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogTitle>{editingGiftcode ? "Sửa giftcode" : "Tạo giftcode mới"}</DialogTitle>
          <GiftcodeForm
            initialValues={editingGiftcode}
            onSubmit={() => {
              setOpenForm(false);
              fetchGiftcodes();
            }}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog xác nhận xoá giftcode */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogTitle>Xác nhận xoá giftcode</DialogTitle>
          <div className="py-2 text-base text-foreground">
            Bạn có chắc chắn muốn xoá giftcode <b>{giftcodeToDelete?.code}</b> không? Hành động này không thể hoàn tác.
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Huỷ</Button>
            <Button variant="destructive" onClick={confirmDelete}>Xoá</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftcodesPage; 