'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Download,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  Filter,
  UploadCloud,
  X,
  FileText,
  Printer
} from 'lucide-react'

import { Dialog } from '@headlessui/react'
import jsPDF from 'jspdf'

interface Purchase {
  id: string
  fecha: string
  tipo: 'paquete' | 'reserva' | 'servicio'
  descripcion: string
  monto: number
  estado: 'completado' | 'pendiente' | 'cancelado' | 'reembolsado'
  metodoPago: string
  numeroTransaccion: string
  factura?: string
  comprobante?: string
}

const mockPurchases: Purchase[] = [
  {
    id: '1',
    fecha: '2024-01-15',
    tipo: 'paquete',
    descripcion: 'Tour Salar de Uyuni 3 días - 2 personas',
    monto: 450,
    estado: 'completado',
    metodoPago: 'Tarjeta de Crédito',
    numeroTransaccion: 'TXN-2024-001',
    factura: 'FAC-001.pdf',
    comprobante: '/comprobantes/COMP-001.pdf'
  },
  {
    id: '2',
    fecha: '2024-03-20',
    tipo: 'reserva',
    descripcion: 'Depósito Hotel Luna Salada',
    monto: 120,
    estado: 'pendiente',
    metodoPago: 'Transferencia Bancaria',
    numeroTransaccion: 'TXN-2024-005',
    comprobante: '/comprobantes/COMP-002.jpg'
  }
]

// =============================
// 🔹 Funciones auxiliares
// =============================
const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'completado': return 'bg-green-100 text-green-800'
    case 'pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    case 'reembolsado': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado: string) => {
  switch (estado) {
    case 'completado': return 'Completado'
    case 'pendiente': return 'Pendiente'
    case 'cancelado': return 'Cancelado'
    case 'reembolsado': return 'Reembolsado'
    default: return estado
  }
}

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'paquete': return 'bg-blue-100 text-blue-800'
    case 'reserva': return 'bg-purple-100 text-purple-800'
    case 'servicio': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTipoText = (tipo: string) => {
  switch (tipo) {
    case 'paquete': return 'Paquete'
    case 'reserva': return 'Reserva'
    case 'servicio': return 'Servicio'
    default: return tipo
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

// =============================
// 🔹 Componente Principal
// =============================
export default function ClientPurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases)
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>(mockPurchases)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    let filtered = purchases
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.numeroTransaccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.metodoPago.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'todos') filtered = filtered.filter(p => p.estado === statusFilter)
    if (typeFilter !== 'todos') filtered = filtered.filter(p => p.tipo === typeFilter)
    if (dateRange.from) filtered = filtered.filter(p => p.fecha >= dateRange.from)
    if (dateRange.to) filtered = filtered.filter(p => p.fecha <= dateRange.to)
    setFilteredPurchases(filtered)
  }, [purchases, searchTerm, statusFilter, typeFilter, dateRange])

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setSelectedPurchase(null)
    setIsModalOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setSelectedFile(f)
  }

  const handleUpload = () => {
    if (!selectedFile || !selectedPurchase) return
    const newPurchase = { ...selectedPurchase, comprobante: selectedFile.name }
    setPurchases(prev => prev.map(p => (p.id === newPurchase.id ? newPurchase : p)))
    setSelectedPurchase(newPurchase)
    alert('✅ Comprobante subido correctamente (simulado)')
    setSelectedFile(null)
  }

  const handleDownload = (filename: string) => {
    alert(`📥 Descargando archivo: ${filename}`)
  }

  const handlePrint = async (purchase: Purchase) => {
    if (!purchase.comprobante) {
      alert('⚠️ No hay comprobante disponible para imprimir.')
      return
    }

    // Si es PDF, simplemente lo abrimos directamente
    if (purchase.comprobante.endsWith('.pdf')) {
      window.open(purchase.comprobante, '_blank')
      return
    }

    // Si es imagen, creamos un PDF temporal
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Comprobante de Pago', 20, 20)
    doc.setFontSize(11)
    doc.text(`Descripción: ${purchase.descripcion}`, 20, 35)
    doc.text(`Monto: ${formatPrice(purchase.monto)}`, 20, 45)
    doc.text(`Método: ${purchase.metodoPago}`, 20, 55)
    doc.text(`Estado: ${getStatusText(purchase.estado)}`, 20, 65)
    doc.text(`Fecha: ${formatDate(purchase.fecha)}`, 20, 75)

    // Si era imagen, agregamos la imagen en el PDF
    const img = new Image()
    img.src = purchase.comprobante
    img.onload = () => {
      doc.addImage(img, 'JPEG', 20, 85, 160, 120)
      doc.save(`Comprobante_${purchase.id}.pdf`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Compras</h1>
        <p className="text-muted-foreground">
          Revisa tus pagos, descarga o imprime tus comprobantes
        </p>
      </div>

      {/* 🔹 Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>
            {filteredPurchases.length} transacción{filteredPurchases.length !== 1 ? 'es' : ''} encontrada{filteredPurchases.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell>{formatDate(purchase.fecha)}</TableCell>
                    <TableCell>{purchase.descripcion}</TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(purchase.tipo)}>{getTipoText(purchase.tipo)}</Badge>
                    </TableCell>
                    <TableCell>{purchase.metodoPago}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(purchase.monto)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.estado)}>{getStatusText(purchase.estado)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(purchase)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(purchase)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Modal simple (sin vista previa) */}
      {isModalOpen && selectedPurchase && (
        <Dialog open={isModalOpen} onClose={handleClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Comprobante de Pago</h2>
                <button onClick={handleClose}>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <p><strong>Descripción:</strong> {selectedPurchase.descripcion}</p>
                <p><strong>Monto:</strong> {formatPrice(selectedPurchase.monto)}</p>
                <p><strong>Método:</strong> {selectedPurchase.metodoPago}</p>
                <p><strong>Estado:</strong> {getStatusText(selectedPurchase.estado)}</p>
              </div>

              <div className="border-t pt-4">
                {selectedPurchase.comprobante ? (
                  <p className="text-sm text-gray-700 mb-3">
                    📄 Comprobante: <b>{selectedPurchase.comprobante}</b>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No hay comprobante subido</p>
                )}

                <label className="text-sm font-medium">Subir nuevo comprobante</label>
                <input type="file" onChange={handleFileChange} className="block w-full mt-2 text-sm" />
                <Button onClick={handleUpload} disabled={!selectedFile} className="mt-3 bg-blue-600 text-white">
                  <UploadCloud className="h-4 w-4 mr-2" /> Subir nuevo
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  )
}
