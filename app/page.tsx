import { User, FolderKanban, Building2, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Willkommen bei <span className="text-primary">Client Garage</span>
        </h1>
        <p className="text-txt-muted text-lg md:text-xl max-w-2xl mb-10">
          Verwalte deine Kunden, Projekte und Teams an einem Ort – einfach, übersichtlich und professionell.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/login" className="group px-8 py-3 bg-primary hover:bg-primary-hover text-primary-fg rounded-lg font-medium flex items-center gap-2 transition-colors">
            Jetzt starten <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
          <Link href="/demo" className="px-8 py-3 bg-tertiary hover:bg-tertiary-hover text-tertiary-fg rounded-lg font-medium transition-colors">
            Demo ansehen
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <FeatureCard 
            icon={<User className="w-8 h-8" />}
            title="Client-Verwaltung"
            description="Alle Kundendaten zentral verwalten und schnell abrufen."
            color="primary"
          />
          <FeatureCard 
            icon={<FolderKanban className="w-8 h-8" />}
            title="Projekt-Management"
            description="Projekte zuweisen, tracken und effizient abschließen."
            color="secondary"
          />
          <FeatureCard 
            icon={<Building2 className="w-8 h-8" />}
            title="Team-Kollaboration"
            description="Zusammenarbeit im Team mit klaren Rollen und Rechten."
            color="tertiary"
          />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground pt-20 ">
          Entdecke weitere Tools von <Link href="https://tcub.app" className="text-secondary hover:text-secondary-hover" target="_blank" rel="noopener noreferrer">TCub</Link>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full py-20">
          <TCubCard
            iconPath="/tcub/client_garage.png"
            title="Client Garage auf TCub"
            description="Entdecke Client Garage auf TCub, der Plattform für innovative Tools."
            color="primary"
            link="https://tcub.app/tools/client-garage/"
          />
          
          <TCubCard
            iconPath="/tcub/client_garage.png"
            title="Time Tweaks"
            description="Zeichne konsequent deine Arbeitszeiten auf und optimiere deinen Workflow."
            color="secondary"
            link="https://tcub.app/tools/time-tweaks/"
          />
          <TCubCard
            iconPath="/tcub/client_garage.png"
            title="Unit Batch"
            description="Rechne deine Projekte mühelos mit Unit Batch ab."
            color="tertiary"
            link="https://tcub.app/tools/unit-batch/"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-txt-muted text-sm border-t border-border">
        © 2026 Client Garage. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "tertiary";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary text-tertiary-fg",
  };

  return (
    <div className="bg-card hover:bg-card-hover border border-border rounded-xl p-6 text-left transition-colors">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-txt-muted">{description}</p>
    </div>
  );
}

function TCubCard({ iconPath, title, description, color, link }: {
  iconPath: string;
  title: string;
  description: string;
  color: "primary" | "secondary" | "tertiary";
  link: string;
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary text-tertiary-fg",
  };

  return (
    <div className="bg-card hover:bg-card-hover border border-border rounded-xl p-6 text-left transition-colors">
      <Link href={link} target="_blank" rel="noopener noreferrer" className="ml-2">
        <div className={`flex justify-center p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
          <Image src={iconPath} height={150 } width={150} alt={title}/>
        </div>
      </Link>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-txt-muted">{description}</p>
    </div>
  );
}