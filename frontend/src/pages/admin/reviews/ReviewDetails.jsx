import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ClipboardCheck, Info } from "lucide-react";
import Layout from "../../../components/Layout";

export default function ReviewDetails() {
  return (
    <Layout mode="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E2DDD0] rounded-[28px] p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive-600/10 border border-olive-600/20 flex items-center justify-center text-olive-600 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222321]">
                Review details
              </h1>
              <p className="text-xs text-[#706E66] mt-0.5">
                Findings are triaged from the review queue
              </p>
            </div>
          </div>

          <Link
            to="/admin/reviews"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFECE3] hover:bg-[#E2DDD0] text-[#555248] text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to queue
          </Link>
        </div>

        <div className="bg-white border border-[#E2DDD0] rounded-[28px] p-8 shadow-2xs text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-olive-600/10 flex items-center justify-center text-olive-600 mb-3">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-[#222321] mb-1">
            Open the review queue to triage findings
          </h2>
          <p className="text-xs text-[#706E66] max-w-md mx-auto mb-4">
            Individual finding details, decisions, and audit trail all live on
            the main review queue.
          </p>
          <Link
            to="/admin/reviews"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
          >
            Go to Review queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
