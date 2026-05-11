"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConsultationDialogProps {
  trigger: React.ReactNode;
  masterName?: string;
}

export default function ConsultationDialog({
  trigger,
  masterName,
}: ConsultationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-slate-900 text-xl">
            {masterName ? `Связаться с ${masterName}` : "Консультация"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <a
            href="https://max.ru/u/f9LHodD0cOI-OzJpTa5P5MYG6df1ZnyUorMCs5GN9wRCwtojOsaacWvikPA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full rounded-none bg-slate-900 hover:bg-slate-800 text-white">
              MAX
            </Button>
          </a>
          <a
            href="https://t.me/sofi_sofi_27"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full rounded-none bg-sky-300 hover:bg-sky-400 text-slate-900">
              Telegram
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
