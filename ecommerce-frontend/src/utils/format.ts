export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Base URL untuk gambar (sesuaikan port backend kamu)
export const IMAGE_URL = "http://localhost:5000/uploads/";
