"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SeminarDetail from "./SeminarDetail";

export default function SeminarPage({ params }: { params: { id: string } }) {
  const seminarId = params.id;
  const searchParams = useSearchParams();

  const [seminar, setSeminar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // For opening reservation modal after payment
  const [openReservation, setOpenReservation] = useState(false);

  // Load seminar
  useEffect(() => {
    async function loadSeminar() {
      const res = await fetch(`/api/seminar/${seminarId}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setSeminar(data);
      setLoading(false);
    }

    loadSeminar();
  }, [seminarId]);

  // Auto-open reservation modal after Stripe payment
  useEffect(() => {
    if (!seminar) return;

    const paidSeminar = searchParams.get("paidSeminar");
    if (paidSeminar === seminar.id) {
      setOpenReservation(true);
    }
  }, [searchParams, seminar]);

  if (loading) return <div className="p-10">Loading…</div>;
  if (!seminar) return <div className="p-10">Seminar not found</div>;

  return (
    <SeminarDetail
      seminar={seminar}
      openReservation={openReservation}
      setOpenReservation={setOpenReservation}
    />
  );
}
