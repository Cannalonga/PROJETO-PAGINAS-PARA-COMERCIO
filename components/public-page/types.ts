export interface Photo {
    slot: string;
    url: string;
    header?: string;
    description?: string;
}

export interface PublicPageData {
    title: string;
    pageDescription: string;
    photos?: Photo[];
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    businessHours?: string;
}
