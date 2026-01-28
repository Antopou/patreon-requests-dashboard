"use client";

import RequestForm from "@/components/RequestForm";
import { loadRequests, addNewRequest } from "@/lib/storage";
import { RequestItem } from "@/types/request";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewRequestPage() {
    const router = useRouter();
    const [items, setItems] = useState<RequestItem[]>([]);

    useEffect(() => {
        loadRequests().then(setItems);
    }, []);

    async function add(item: RequestItem) {
        await addNewRequest(item);
        router.push("/");
    }

    return (
        <div className="mx-auto max-w-3xl animate-fade-in p-4">
            <h1 className="mb-6 text-2xl font-bold text-slate-800">Request</h1>
            <RequestForm onAdd={add} />
        </div>
    );
}
