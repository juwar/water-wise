import {
  CheckCircle,
  Droplet,
  User,
  CreditCard,
  FileText,
  MapPin,
} from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import IconApp from "../../../app/assets/icon2.png";

type InvoiceData = {
  name: string;
  nik: string;
  region: string;
  usage: number;
  rate: number;
  total: number;
  status: string;
  paymentDate: string;
};

type InvoiceProps = {
  invoiceData: InvoiceData
}

export default function WaterInvoice({
  invoiceData
}: InvoiceProps) {
  // Using the data from the table
  // const invoiceData: InvoiceProps = {
  //   name: "Test 2",
  //   nik: "123456789123456",
  //   region: "Region 1",
  //   usage: 120,
  //   rate: 10000,
  //   total: 1200000,
  //   status: "Lunas",
  //   paymentDate: "4/28/2025",
  // };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div ref={contentRef}>
        <div className="bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Image src={IconApp} alt={""} className="h-10 w-auto" />
            </div>
            <div className="text-right">
              <p className="text-gray-700 text-sm">
                Invoice #WTR-{Math.floor(1000 + Math.random() * 9000)}
              </p>
              <p className="text-gray-700 text-xs">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          {/* Customer Info */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Informasi Pelanggan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium text-gray-800">
                    {invoiceData.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">NIK</p>
                  <p className="font-medium text-gray-800">{invoiceData.nik}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Wilayah</p>
                  <p className="font-medium text-gray-800">
                    {invoiceData.region}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Bayar</p>
                  <p className="font-medium text-gray-800">
                    {invoiceData.paymentDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Rincian Penggunaan
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600">Penggunaan Air</p>
                <p className="font-medium">{invoiceData.usage} m³</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600">Tarif per m³</p>
                <p className="font-medium">
                  Rp {invoiceData.rate.toLocaleString()}
                </p>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2"></div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700">Total Tagihan</p>
                <p className="font-bold text-blue-600 text-lg">
                  Rp {invoiceData.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status - Now more prominent and at the bottom */}
          <div className="mt-6 mb-4">
            <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Status Pembayaran</p>
                    <p className="font-bold text-green-800 text-xl">
                      {invoiceData.status}
                    </p>
                  </div>
                </div>
                <div className="bg-green-600 px-4 py-2 rounded-lg shadow-sm">
                  <p className="text-white font-bold">TELAH DIBAYAR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="text-center text-gray-600 text-sm mt-8">
            <p>Terima kasih atas pembayaran Anda</p>
            <p>Untuk pertanyaan lebih lanjut, hubungi layanan pelanggan kami</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplet className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-600">AquaBill Services</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center"
            onClick={() => reactToPrintFn()}
          >
            <FileText className="h-4 w-4 mr-1" />
            Unduh PDF
          </button>
        </div>
      </div>
    </div>
  );
}
