import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getKnowledgeDetail } from '@/services/api';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const ROWS_PER_PAGE = 20;

interface KnowledgeDetailData {
  title: string;
  status: string;
  type: string;
  table_data?: Record<string, unknown[][]>; // key: sheet name, value: 2D array
  content?: string;
  preview?: string;
}

const KnowledgeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<KnowledgeDetailData | null>(null);
  const [page, setPage] = useState(1);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getKnowledgeDetail(id)
      .then(res => {
        if (res.success) {
          setData({
            ...res.data,
            table_data: res.table_data
          });
        } else setError('Không tìm thấy tri thức');
      })
      .catch(() => setError('Lỗi khi tải chi tiết tri thức'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (data && data.type === 'table' && data.table_data) {
      const sheetNames = Object.keys(data.table_data);
      if (sheetNames.length > 0) setSelectedSheet(sheetNames[0]);
    }
  }, [data]);

  useEffect(() => { setPage(1); }, [selectedSheet]);

  return (
    <div className="container mx-auto py-8 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Chi tiết tri thức</h1>
      {loading ? (
        <div className="text-muted-foreground">Đang tải...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : !data ? null : (
        <div className="bg-card rounded-xl shadow p-4">
          <div className="mb-4">
            <div className="text-lg font-semibold text-foreground mb-1">{data.title}</div>
            <div className="text-sm text-muted-foreground mb-1">Trạng thái: <span className="capitalize font-medium">{data.status}</span></div>
            <div className="text-sm text-muted-foreground mb-1">Loại: {data.type === 'table' ? 'Bảng' : 'Văn bản'}</div>
          </div>
          {data.type === 'table' && data.table_data && Object.keys(data.table_data).length > 0 ? (
            <>
              {/* Tab chọn sheet */}
              <div className="flex gap-2 mb-4">
                {Object.keys(data.table_data).map(sheet => (
                  <Button
                    key={sheet}
                    size="sm"
                    variant={selectedSheet === sheet ? 'default' : 'outline'}
                    onClick={() => setSelectedSheet(sheet)}
                  >
                    {sheet}
                  </Button>
                ))}
              </div>
              {/* Hiển thị bảng sheet đang chọn */}
              {selectedSheet &&
                Array.isArray(data.table_data[selectedSheet]) &&
                data.table_data[selectedSheet].length > 0 &&
                Array.isArray(data.table_data[selectedSheet][0]) ? (
                <div className="overflow-x-auto" style={{ maxWidth: 900 }}>
                  <Table className="min-w-fit w-auto text-sm">
                    {(() => {
                      const rows = data.table_data![selectedSheet] as unknown[][];
                      const header = rows[0];
                      const colCount = header.length;
                      // Lọc các dòng hợp lệ: đúng số cột và có ít nhất 1 ô có giá trị
                      const validRows = rows.slice(1).filter(row =>
                        Array.isArray(row) && row.length === colCount && row.some(cell => cell)
                      );
                      const totalRows = validRows.length;
                      const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
                      const startIdx = (page - 1) * ROWS_PER_PAGE;
                      const endIdx = Math.min(startIdx + ROWS_PER_PAGE, totalRows);
                      const bodyRows = validRows.slice(startIdx, endIdx);

                      return (
                        <>
                          <TableHeader>
                            <TableRow>
                              {header.map((cell, j) => <TableHead key={j}>{String(cell)}</TableHead>)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bodyRows.map((row, i) => (
                              <TableRow key={i}>
                                {row.map((cell, j) => (
                                  <TableCell key={j}>
                                    {typeof cell === 'string'
                                      ? cell.replace(/\n/g, ' ')
                                      : (cell !== undefined ? String(cell) : '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                          {totalPages > 1 && (
                            <tfoot>
                              <tr>
                                <td colSpan={colCount} className="pt-2">
                                  <div className="flex justify-center items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
                                    <span className="text-xs">Trang {page} / {totalPages}</span>
                                    <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</Button>
                                  </div>
                                </td>
                              </tr>
                            </tfoot>
                          )}
                          {/* Có thể hiển thị cảnh báo nếu có dòng bị loại bỏ */}
                          {rows.length - 1 !== totalRows && (
                            <caption className="text-xs text-muted-foreground pt-2 text-center">
                              Đã tự động loại {rows.length - 1 - totalRows} dòng dữ liệu không hợp lệ khỏi bảng.
                            </caption>
                          )}
                        </>
                      );
                    })()}
                  </Table>
                </div>
              ) : (
                <div className="italic text-muted-foreground p-2">Không có dữ liệu bảng</div>
              )}
            </>
          ) : data.type === 'table' ? (
            <div className="italic text-muted-foreground p-2">Không có dữ liệu bảng</div>
          ) : (
            <div className="text-base text-foreground whitespace-pre-line mt-2">
              {data.content || data.preview || <span className="italic">Không có nội dung</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeDetailPage;
