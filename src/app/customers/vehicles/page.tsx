"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";

import {
  Plus,
  Car,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  Upload,
  ImagePlus,
} from "lucide-react";

import { vehicleService } from "@/services/vehicle.service";
import { Button } from "@/components/ui/button";

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
  {
    name: "Alfa Romeo",
    logo: "/brands/alfa-romeo.png",
  },
  {
    name: "Aston Martin",
    logo: "/brands/aston-martin.png",
  },
  {
    name: "Audi",
    logo: "/brands/audi.png",
  },
  {
    name: "Bentley",
    logo: "/brands/bentley.png",
  },
  {
    name: "BMW",
    logo: "/brands/bmw.png",
  },
  {
    name: "Bugatti",
    logo: "/brands/bugatti.png",
  },
  {
    name: "Cadillac",
    logo: "/brands/cadillac.png",
  },
  {
    name: "Chevrolet",
    logo: "/brands/chevrolet.png",
  },
  {
    name: "Ferrari",
    logo: "/brands/ferrari.png",
  },
  {
    name: "Honda",
    logo: "/brands/honda.png",
  },
  {
    name: "Koenigsegg",
    logo: "/brands/koenigsegg.png",
  },
  {
    name: "Lexus",
    logo: "/brands/lexus.png",
  },
  {
    name: "Maserati",
    logo: "/brands/maserati.png",
  },
  {
    name: "Mazda",
    logo: "/brands/mazda.png",
  },
  {
    name: "McLaren",
    logo: "/brands/mclaren.png",
  },
  {
    name: "Mercedes Benz",
    logo: "/brands/mercedes.png",
  },
  {
    name: "Mitsubishi",
    logo: "/brands/mitsubishi.png",
  },
  {
    name: "Nissan",
    logo: "/brands/nissan.png",
  },
  {
    name: "Opel",
    logo: "/brands/opel.png",
  },
  {
    name: "Porsche",
    logo: "/brands/porsche.png",
  },
  {
    name: "Rolls Royce",
    logo: "/brands/rolls-royce.png",
  },
  {
    name: "Subaru",
    logo: "/brands/subaru.png",
  },
  {
    name: "Toyota",
    logo: "/brands/toyota.png",
  },
  {
    name: "Volkswagen",
    logo: "/brands/volkswagen.png",
  },
];

const getBrandLogo = (brand: string) => {
  return vehicleBrands.find((item) => item.name === brand)?.logo || null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    brand: "",
    model: "",
    year: "",
    license_plate: "",
    image: null,
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await vehicleService.getMyVehicles();

      setVehicles(response.data || []);
    } catch (err) {
      console.error("Failed fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getMyVehicles();
        setVehicles(response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadVehicles();
  }, []);

  const closeModal = () => {
    setShowModal(false);

    setForm({
      brand: "",
      model: "",
      year: "",
      license_plate: "",
      image: null,
    });

    setPreview(null);
  };

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

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
    }));

    setPreview(null);
  };

  const handleCreateVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
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

      await vehicleService.createVehicle(formData);

      closeModal();

      void fetchVehicles();
    } catch (err) {
      console.error("Create vehicle failed:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmDelete) return;

    try {
      await vehicleService.deleteVehicle(String(id));

      void fetchVehicles();
    } catch (err) {
      console.error("Delete vehicle failed:", err);
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Manage your registered vehicles
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          Add Vehicle
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="h-72 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C2692A]" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && vehicles.length === 0 && (
        <div className="h-72 rounded-3xl border border-border bg-card flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No vehicles found.</p>
        </div>
      )}

      {/* VEHICLES GRID */}
      {!loading && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const vehicleImage = getVehicleImageUrl(vehicle.image);
            const brandLogo = getBrandLogo(vehicle.brand);

            return (
              <div
                key={vehicle.id}
                className="group rounded-3xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
              >
                {/* VEHICLE IMAGE */}
                <div className="relative h-56 bg-[#111111] overflow-hidden">
                  {vehicleImage ? (
                    <Image
                      src={vehicleImage}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      quality={70}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                      {vehicle.license_plate}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 rounded-xl bg-[#C2692A]/90 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
                      {vehicle.year}
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <p className="text-[11px] text-white/60 uppercase tracking-[0.22em]">
                      Registered Vehicle
                    </p>

                    <div className="mt-2 flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-white/95 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                        {brandLogo ? (
                          <Image
                            src={brandLogo}
                            alt={`${vehicle.brand} logo`}
                            width={30}
                            height={30}
                            className="object-contain"
                          />
                        ) : (
                          <Car size={20} className="text-[#C2692A]" />
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-white truncate drop-shadow-sm">
                        {vehicle.brand} {vehicle.model}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Brand</p>

                      <div className="mt-2 flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {brandLogo ? (
                            <Image
                              src={brandLogo}
                              alt={`${vehicle.brand} logo`}
                              width={22}
                              height={22}
                              className="object-contain"
                            />
                          ) : (
                            <Car size={16} className="text-[#C2692A]" />
                          )}
                        </div>

                        <p className="text-sm font-semibold truncate">
                          {vehicle.brand}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p className="text-sm font-semibold mt-2 truncate">
                        {vehicle.model}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 mt-5">
                    <Link
                      href={`/customers/vehicles/${vehicle.id}`}
                      className="flex-1 h-11 rounded-xl border border-border bg-background hover:bg-accent transition flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Pencil size={15} />
                      Edit Vehicle
                    </Link>

                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="w-11 h-11 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-7 my-10">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Add Vehicle</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Register your vehicle
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleCreateVehicle} className="space-y-5">
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
                  Vehicle Image
                </label>

                {!preview ? (
                  <label className="group flex flex-col items-center justify-center w-full h-60 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
                      <ImagePlus size={24} className="text-[#C2692A]" />
                    </div>

                    <p className="text-sm font-medium">Upload vehicle image</p>

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
                      alt="Vehicle preview"
                      width={1200}
                      height={800}
                      className="w-full h-60 object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
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

              {/* BUTTON */}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-12 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Vehicle
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
