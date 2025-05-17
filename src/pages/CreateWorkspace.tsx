import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const languages = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "ja", label: "Japanese" },
  // Thêm các ngôn ngữ khác nếu cần
];

const CreateWorkspace = () => {
  const [brandName, setBrandName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [brandProducts, setBrandProducts] = useState("");
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const isValid = brandName && businessType && language && location && brandDescription;

  useEffect(() => {
    setLoadingLocation(true);
    axios.get("https://restcountries.com/v3.1/all")
      .then(res => {
        const countries = res.data.map((c: { name: { common: string } }) => c.name.common).sort();
        setLocations(countries);
      })
      .catch(() => setLocations([]))
      .finally(() => setLoadingLocation(false));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý gửi dữ liệu workspace lên server tại đây
    alert("Tạo workspace thành công!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-lg shadow p-8 space-y-6">
        <h2 className="text-2xl font-bold mb-2">Brand profile</h2>
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand name</Label>
          <Input id="brandName" value={brandName} onChange={e => setBrandName(e.target.value)} maxLength={50} required placeholder="Your brand name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business type</Label>
          <Input id="businessType" value={businessType} onChange={e => setBusinessType(e.target.value)} maxLength={50} required placeholder="Eg: Beauty & spa, Clinic, Software develop, Restaurant, ..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select id="language" value={language} onChange={e => setLanguage(e.target.value)} required className="w-full border rounded px-3 py-2">
            <option value="">Select language</option>
            {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            disabled={loadingLocation}
          >
            <option value="">Select country</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <h2 className="text-xl font-bold mt-6 mb-2">Brand & product description</h2>
        <div className="space-y-2">
          <Label htmlFor="brandDescription">Brand description</Label>
          <Textarea id="brandDescription" value={brandDescription} onChange={e => setBrandDescription(e.target.value)} required placeholder="List and briefly describe your products or services" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandProducts">Brand products / services (Optional)</Label>
          <Textarea id="brandProducts" value={brandProducts} onChange={e => setBrandProducts(e.target.value)} placeholder="List and briefly describe your products or services" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL - Website, fanpage... (Optional)</Label>
          <Input id="url" value={url} onChange={e => setUrl(e.target.value)} maxLength={155} placeholder="www.example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Brand logo (Optional)</Label>
          <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
        </div>
        <Button type="submit" className="w-full" disabled={!isValid}>Next</Button>
      </form>
    </div>
  );
};

export default CreateWorkspace; 