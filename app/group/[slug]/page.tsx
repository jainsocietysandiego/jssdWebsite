import { notFound } from 'next/navigation';

interface Committee {
  [key: string]: string;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbyBLwwT4JaPjLzmWvrhtsXmiVEN0_hBgM1qQJMYoun6mhfcQAtFwYfZUhJWT1w6jV-b/exec';

const EXCLUDED_KEYS = ['Slug'];
const CONTACT_KEYS = ['Contact 1 Name', 'Contact 1 Phone', 'Contact 1 Email', 'Contact 2 Name', 'Contact 2 Phone', 'Contact 2 Email'];
const BULLET_KEYS = ['Activities']; // You can expand this list if needed

export async function generateStaticParams() {
  const res = await fetch(API_URL, { cache: 'no-store' });
  const json = await res.json();

  return json.committees.map((c: Committee) => ({
    slug: c['Slug'],
  }));
}

export default async function CommitteePage({ params }: { params: { slug: string } }) {
  const res = await fetch(API_URL, { cache: 'no-store' });
  const data = await res.json();
  const committee: Committee | undefined = data.committees.find((c: Committee) => c['Slug'] === params.slug);

  if (!committee) return notFound();

  const driveFileId = committee['Banner Image Name']?.split('id=')[1];
const imageUrl = driveFileId
  ? `https://drive.google.com/thumbnail?id=${driveFileId}`
  : '/default-banner.jpg';

  const title = committee['Committee Name'];

  return (
    <main className="pt-16">
    <div className="pb-12">
      {/* Banner Section */}
  <div className="relative h-64 w-full overflow-hidden">
  <img
    src={imageUrl}
    alt={committee['Committee Name']}
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black bg-opacity-40" />
  <h1 className="absolute inset-0 z-10 flex items-center justify-center text-white text-4xl font-bold">
    {committee['Committee Name']}
  </h1>
</div>




      {/* Dynamic Content Sections */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {Object.entries(committee).map(([key, value]) => {
          if (EXCLUDED_KEYS.includes(key) || key === 'Committee Name' || key === 'Banner Image Name') {
            return null;
          }

          if (CONTACT_KEYS.includes(key)) {
            return null; // We'll render contacts below
          }

          if (BULLET_KEYS.includes(key)) {
            const bullets = value.split(',').map((item) => item.trim()).filter(Boolean);
            if (bullets.length === 0) return null;

            return (
              <div key={key}>
                <h2 className="text-xl font-semibold mb-2">{key}</h2>
                <ul className="list-disc list-inside text-gray-700">
                  {bullets.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            );
          }

          if (value.trim() === '') return null;

          return (
            <div key={key}>
              <h2 className="text-xl font-semibold mb-2">{key}</h2>
              <p className="text-gray-700 whitespace-pre-line">{value}</p>
            </div>
          );
        })}

        {/* Contact Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact Details</h2>
          {[1, 2].map((num) => {
            const name = committee[`Contact ${num} Name`];
            const phone = committee[`Contact ${num} Phone`];
            const email = committee[`Contact ${num} Email`];

            if (!name) return null;

            return (
              <div key={num} className="mb-4 text-gray-700">
                <p className="font-medium">{name}</p>
                {phone && <p>📞 {phone}</p>}
                {email && <p>✉️ {email}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </main>
  );
}
