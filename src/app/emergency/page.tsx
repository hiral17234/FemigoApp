
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, UserPlus, Siren, ShieldCheck, Hospital, Flame, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { emergencyContacts, type EmergencyService } from '@/lib/emergency-contacts';
import { auth, db } from '@/lib/firebase';

type TrustedContact = {
  id: string;
  name: string;
  phone: string;
};

const translations = {
    en: {
        error: "Error",
        notLoggedIn: "Not logged in",
        notLoggedInDesc: "You must be logged in to add contacts.",
        invalidInput: "Invalid Input",
        invalidInputDesc: "Please enter a valid name and phone number (5-15 digits).",
        contactSaved: "Contact Saved!",
        contactSavedDesc: (name: string) => `${name} has been added to your trusted contacts.`,
        saveFailed: "Save Failed",
        saveFailedDesc: "Could not save your contact. Please try again.",
        couldNotLoadContacts: "Could not load your contacts.",
        emergencyServices: "Emergency Services",
        emergencyServicesDesc: "In an emergency, call an appropriate number for help.",
        trustedContacts: "Trusted Contacts",
        trustedContactsDesc: "You can trust your trustworthy contacts for help.",
        noTrustedContacts: "No trusted contacts added yet.",
        addTrustedContact: "Add Trusted Contact",
        addNewTrustedContact: "Add New Trusted Contact",
        nameLabel: "Name",
        phoneLabel: "Phone",
        saveContactButton: "Save contact",
    },
    hi: {
        error: "त्रुटि",
        notLoggedIn: "लॉग इन नहीं हैं",
        notLoggedInDesc: "संपर्क जोड़ने के लिए आपको लॉग इन होना चाहिए।",
        invalidInput: "अमान्य इनपुट",
        invalidInputDesc: "कृपया एक मान्य नाम और फ़ोन नंबर (5-15 अंक) दर्ज करें।",
        contactSaved: "संपर्क सहेजा गया!",
        contactSavedDesc: (name: string) => `${name} को आपके विश्वसनीय संपर्कों में जोड़ दिया गया है।`,
        saveFailed: "सहेजें विफल",
        saveFailedDesc: "आपका संपर्क सहेजा नहीं जा सका। कृपया फिर से प्रयास करें।",
        couldNotLoadContacts: "आपके संपर्क लोड नहीं हो सके।",
        emergencyServices: "आपातकालीन सेवाएं",
        emergencyServicesDesc: "आपात स्थिति में, सहायता के लिए उपयुक्त नंबर पर कॉल करें।",
        trustedContacts: "विश्वसनीय संपर्क",
        trustedContactsDesc: "आप सहायता के लिए अपने भरोसेमंद संपर्कों पर भरोसा कर सकते हैं।",
        noTrustedContacts: "अभी तक कोई विश्वसनीय संपर्क नहीं जोड़ा गया है।",
        addTrustedContact: "विश्वसनीय संपर्क जोड़ें",
        addNewTrustedContact: "नया विश्वसनीय संपर्क जोड़ें",
        nameLabel: "नाम",
        phoneLabel: "फ़ोन",
        saveContactButton: "संपर्क सहेजें",
    }
}

export default function EmergencyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const fetchUserData = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setTrustedContacts(userData.trustedContacts || []);
                const countryCode = userData.country || 'default';
                setEmergencyServices(emergencyContacts[countryCode] || emergencyContacts.default);
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    }
    fetchUserData();
  }, [router]);

  const handleSaveContact = async () => {
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: t.notLoggedIn, description: t.notLoggedInDesc });
        return;
    }

    if (newContactName.trim() === '' || !/^\d{5,15}$/.test(newContactPhone.trim())) {
      toast({
        variant: "destructive",
        title: t.invalidInput,
        description: t.invalidInputDesc,
      });
      return;
    }

    const newContact: TrustedContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
    };
    
    try {
        const updatedContacts = [...trustedContacts, newContact];
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { trustedContacts: updatedContacts }, { merge: true });

        setTrustedContacts(updatedContacts);
        setNewContactName('');
        setNewContactPhone('');
        setIsDialogOpen(false);
        toast({
            title: t.contactSaved,
            description: t.contactSavedDesc(newContact.name),
        });
    } catch (error) {
        console.error("Error saving contact:", error);
        toast({ variant: "destructive", title: t.saveFailed, description: t.saveFailedDesc });
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#06010F]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06010F] text-gray-200 font-sans">
      <div className="relative mx-auto max-w-md bg-[#06010F] pb-24">
        <header className="flex items-center justify-between p-4 sticky top-0 bg-[#06010F]/80 backdrop-blur-sm z-10 border-b border-purple-900/50">
          <Link href="/dashboard" className="text-gray-400 hover:text-primary">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-1 text-2xl font-bold text-white">
            Femigo
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#EC008C"/>
            </svg>
          </div>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        <main className="p-4 space-y-8">
          <section>
            <h1 className="text-2xl font-bold text-white">{t.emergencyServices}</h1>
            <p className="text-gray-400 mt-1">{t.emergencyServicesDesc}</p>
            <div className="space-y-3 mt-4">
              {emergencyServices.map(service => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-900/70 rounded-xl shadow-lg shadow-black/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-900/30 rounded-lg text-primary">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">{service.number}</p>
                      <p className="text-gray-400 text-sm">{service.name}</p>
                    </div>
                  </div>
                  <a href={`tel:${service.number}`} className="flex items-center justify-center h-12 w-12 bg-gradient-to-r from-[#EC008C] to-[#FF55A5] text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
                    <Phone size={24} />
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h1 className="text-2xl font-bold text-white">{t.trustedContacts}</h1>
            <p className="text-gray-400 mt-1">{t.trustedContactsDesc}</p>
            <div className="space-y-3 mt-4">
              {trustedContacts.length > 0 ? trustedContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-900/70 rounded-xl shadow-lg shadow-black/20">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage data-ai-hint="person face" src={`https://placehold.co/60x60.png`} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{contact.name}</p>
                      <p className="text-gray-400 text-sm">{contact.phone}</p>
                    </div>
                  </div>
                  <a href={`tel:${contact.phone}`} className="flex items-center justify-center h-12 w-12 bg-gradient-to-r from-[#EC008C] to-[#FF55A5] text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
                    <Phone size={24} />
                  </a>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 bg-gray-900/70 rounded-xl">
                    <p>{t.noTrustedContacts}</p>
                </div>
              )}
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                     <Button className="w-full mt-4 bg-gradient-to-r from-[#EC008C] to-[#FF55A5] hover:shadow-lg text-white rounded-xl py-6 text-lg font-semibold">
                        <UserPlus className="mr-2" /> {t.addTrustedContact}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-950 border border-purple-900 text-white rounded-lg">
                    <DialogHeader>
                    <DialogTitle>{t.addNewTrustedContact}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-gray-300">{t.nameLabel}</Label>
                        <Input id="name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="col-span-3 bg-gray-800 border-gray-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right text-gray-300">{t.phoneLabel}</Label>
                        <Input id="phone" type="tel" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} className="col-span-3 bg-gray-800 border-gray-700" />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit" onClick={handleSaveContact} className="bg-gradient-to-r from-[#EC008C] to-[#FF55A5] text-white">{t.saveContactButton}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </section>
        </main>
      </div>
    </div>
  );
}
