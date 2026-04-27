import { PageHeader, Button } from "@senlo/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TriggersList } from "apps/web/components/campaigns-list";

export default function TriggersPage() {
  return (
    <main className="max-w-6xl mx-auto py-10 px-8">
      <PageHeader
        title="Transactional Emails"
        description="Monitor and manage all your transactional emails in one place."
        actions={
          <Link href="/triggers/new">
            <Button>
              <Plus size={16} />
              New Transactional
            </Button>
          </Link>
        }
      />

      <TriggersList showFilters={true} />
    </main>
  );
}
