"use client";

import Link from "next/link";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Car,
  Loader2,
  Save,
  Upload,
  ImagePlus,
  X,
} from "lucide-react";

import { vehicleService } from "@/services/vehicle.service";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  image?: string | null;
}

interface VehicleForm {
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  image: File | null;
}

interface VehicleBrand {
  name: string;
  logo: string;
}

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const vehicleBrands: VehicleBrand[] = [
  { name: "Alfa Romeo", logo: "/brands/alfa-romeo.png" },
  { name: "Aston Martin", logo: "/brands/aston-martin.png" },
  { name: "Audi", logo: "/brands/audi.png" },
  { name: "Bentley", logo: "/brands/bentley.png" },
  { name: "BMW", logo: "/brands/bmw.png" },
  { name: "Bugatti", logo: "/brands/bugatti.png" },
  { name: "Cadillac", logo: "/brands/cadillac.png" },
  { name: "Chevrolet", logo: "/brands/chevrolet.png" },
  { name: "Ferrari", logo: "/brands/ferrari.png" },
  { name: "Honda", logo: "/brands/honda.png" },
  { name: "Koenigsegg", logo: "/brands/koenigsegg.png" },
  { name: "Lexus", logo: "/brands/lexus.png" },
  { name: "Maserati", logo: "/brands/maserati.png" },
  { name: "Mazda", logo: "/brands/mazda.png" },
  { name: "McLaren", logo: "/brands/mclaren.png" },
  { name: "Mercedes Benz", logo: "/brands/mercedes.png" },
  { name: "Mitsubishi", logo: "/brands/mitsubishi.png" },
  { name: "Nissan", logo: "/brands/nissan.png" },
  { name: "Opel", logo: "/brands/opel.png" },
  { name: "Porsche", logo: "/brands/porsche.png" },
  { name: "Rolls Royce", logo: "/brands/rolls-royce.png" },
  { name: "Subaru", logo: "/brands/subaru.png" },
  { name: "Toyota", logo: "/brands/toyota.png" },
  { name: "Volkswagen", logo: "/brands/volkswagen.png" },
];

const getBrandLogo = (brand: string) => {
  return vehicleBrands.find((item) => item.name === brand)?.logo || null;
};

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();

  const vehicleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    brand: "",
    model: "",
    year: "",
    license_plate: "",
    image: null,
  });

  const selectedBrandLogo = getBrandLogo(form.brand);

  const getVehicleImageUrl = (image?: string | null) => {
    if (!image) return null;

    if (image.startsWith("http")) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return `${BACKEND_BASE_URL}${image}`;
    }

    return `${BACKEND_BASE_URL}/uploads/${image}`;
  };

  const fetchVehicle = async () => {
    try {
      setLoading(true);

      const response = await vehicleService.getVehicleById(vehicleId);

      const vehicle: Vehicle = response.data;

      setForm({
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: String(vehicle.year || ""),
        license_plate: vehicle.license_plate || "",
        image: null,
      });

      setCurrentImage(getVehicleImageUrl(vehicle.image));
    } catch (error) {
      console.error("Failed fetch vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vehicleId) return;

    const loadVehicle = async () => {
      try {
        await fetchVehicle();
      } catch (error) {
        console.error(error);
      }
    };

    void loadVehicle();
  }, [vehicleId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File must be an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image max size is 5MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
    }));

    setPreview(null);
  };

  const handleUpdateVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const formData = new FormData();

      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("year", form.year);
      formData.append("license_plate", form.license_plate);

      if (form.image) {
        formData.append("image", form.image);
      }

      await vehicleService.updateVehicle(vehicleId, formData);

      router.push("/customers/vehicles");
    } catch (error) {
      console.error("Update vehicle failed:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C2692A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/customers/vehicles"
          className="w-11 h-11 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle</h1>

          <p className="text-sm text-muted-foreground mt-1">
            Update your registered vehicle information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* FORM CARD */}
        <div className="rounded-3xl border border-border bg-card p-7">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center overflow-hidden">
              {selectedBrandLogo ? (
                <Image
                  src={selectedBrandLogo}
                  alt={`${form.brand} logo`}
                  width={34}
                  height={34}
                  className="object-contain"
                />
              ) : (
                <Car size={24} className="text-[#C2692A]" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {form.brand || "Vehicle Brand"} {form.model}
              </h2>
              <p className="text-sm text-muted-foreground">
                {form.license_plate || "License Plate"}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateVehicle} className="space-y-5">
            {/* BRAND */}
            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>

              <select
                value={form.brand}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                required
                className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#C2692A]"
              >
                <option value="">Select brand</option>

                {vehicleBrands.map((brand) => (
                  <option key={brand.name} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MODEL */}
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>

              <input
                type="text"
                value={form.model}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    model: e.target.value,
                  }))
                }
                placeholder="M4 Competition"
                required
                className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#C2692A]"
              />
            </div>

            {/* YEAR + LICENSE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>

                <input
                  type="text"
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                  placeholder="2024"
                  required
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#C2692A]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  License Plate
                </label>

                <input
                  type="text"
                  value={form.license_plate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      license_plate: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="B 1234 XYZ"
                  required
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm uppercase outline-none focus:border-[#C2692A]"
                />
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Change Vehicle Image
              </label>

              {!preview ? (
                <label className="group flex flex-col items-center justify-center w-full h-60 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
                    <ImagePlus size={24} className="text-[#C2692A]" />
                  </div>

                  <p className="text-sm font-medium">
                    Upload new vehicle image
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-[#C2692A]">
                    <Upload size={15} />
                    Choose File
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  <Image
                    src={preview}
                    alt="New vehicle preview"
                    width={1200}
                    height={800}
                    className="w-full h-60 object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-black/70 hover:bg-black text-white flex items-center justify-center transition"
                  >
                    <X size={18} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                    <p className="text-sm text-white font-medium truncate">
                      {form.image?.name}
                    </p>

                    <p className="text-xs text-white/70">
                      {((form.image?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="h-12 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Vehicle
                  </>
                )}
              </button>

              <Link
                href="/customers/vehicles"
                className="h-12 px-5 rounded-xl border border-border hover:bg-accent transition flex items-center text-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* PREVIEW CARD */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden h-fit">
          <div className="relative h-64 bg-[#111111] overflow-hidden">
            {preview ? (
              <Image
                src={preview}
                alt="Vehicle preview"
                fill
                sizes="420px"
                className="object-cover"
              />
            ) : currentImage ? (
              <Image
                src={currentImage}
                alt={`${form.brand} ${form.model}`}
                fill
                sizes="420px"
                quality={70}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#1A1A1A] to-[#0A0A0A]">
                <div className="w-20 h-20 rounded-3xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center">
                  <Car size={36} className="text-[#C2692A]" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 text-xs font-medium text-white uppercase shadow-lg">
                {form.license_plate || "B 1234 XYZ"}
              </div>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <div className="px-3 py-1.5 rounded-xl bg-[#C2692A]/90 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
                {form.year || "2024"}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <p className="text-[11px] text-white/60 uppercase tracking-[0.22em]">
                Vehicle Preview
              </p>

              <div className="mt-2 flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/95 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {selectedBrandLogo ? (
                    <Image
                      src={selectedBrandLogo}
                      alt={`${form.brand} logo`}
                      width={30}
                      height={30}
                      className="object-contain"
                    />
                  ) : (
                    <Car size={20} className="text-[#C2692A]" />
                  )}
                </div>

                <h2 className="text-xl font-bold text-white truncate drop-shadow-sm">
                  {form.brand || "Brand"} {form.model || "Model"}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold">Live Preview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Changes will be saved after you click update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
