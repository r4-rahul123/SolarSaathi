import { Mail } from "lucide-react";
import { BusinessContactDetails } from "@/components/BusinessContactDetails";
import { BUSINESS_CONTACT } from "@/config/business";

export default function ContactPage() {
  return (
    <main className="min-h-[65vh] bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
          SolarSaathi Support
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          For a general enquiry, quotation question, project update or help reading an electricity bill, email the {BUSINESS_CONTACT.contactPerson}.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{BUSINESS_CONTACT.businessName} Demo Support</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Official support contact</p>
            </div>
          </div>
          <BusinessContactDetails subject="General enquiry" />
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Selecting the email address opens your default email application. SolarSaathi does not send a message automatically from this page.
          </p>
        </div>
      </section>
    </main>
  );
}
