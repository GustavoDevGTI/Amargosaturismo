const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

type GalleryAlbum = {
  id: string;
  title: string;
};

type GalleryCollection = {
  key: string;
  yearLabel: string;
  title: string;
  subtitle: string;
  photoCount?: number;
  albums: GalleryAlbum[];
};

type GalleryDefinition = {
  title: string;
  subtitle: string;
  profileUrl: string;
  collections: GalleryCollection[];
};

type FlickrPhoto = {
  id: string;
  secret: string;
  server: string;
  title?: string;
  url_q?: string;
  url_m?: string;
  url_z?: string;
  url_l?: string;
  url_o?: string;
  width_q?: string;
  height_q?: string;
  width_m?: string;
  height_m?: string;
  width_z?: string;
  height_z?: string;
  width_l?: string;
  height_l?: string;
  width_o?: string;
  height_o?: string;
};

type FlickrApiResponse<T> = {
  stat: "ok" | "fail";
  message?: string;
  code?: number;
} & T;

type GalleryWarning = {
  albumId: string;
  albumTitle: string;
  message: string;
};

const galleries: Record<string, GalleryDefinition> = {
  "carnaval-cultural": {
    title: "Carnaval Cultural",
    subtitle: "Escolha o ano do Carnaval Cultural para abrir o album correspondente dentro da aba Galeria.",
    profileUrl: "https://www.flickr.com/photos/prefeituradeamargosa/",
    collections: [
      {
        key: "2026",
        yearLabel: "2026",
        title: "Carnaval Cultural 2026",
        subtitle: "Album do site com 11 albuns oficiais do Flickr organizados em uma unica galeria de 2026.",
        photoCount: 527,
        albums: [
          {
            id: "72177720332110123",
            title: "Carnaval Cultural 2026 rural eletrica (parte 1)",
          },
          {
            id: "72177720332117884",
            title: "Carnaval Cultural 2026 rural eletrica (parte 2)",
          },
          {
            id: "72177720332109978",
            title: "Carnaval Cultural 2026 dia 17 (parte 1)",
          },
          {
            id: "72177720332090102",
            title: "Carnaval Cultural 2026 dia 17 (parte 2)",
          },
          {
            id: "72177720332109893",
            title: "Carnaval Cultural 2026 dia 16 (parte 1)",
          },
          {
            id: "72177720332091146",
            title: "Carnaval Cultural 2026 dia 16 (parte 2)",
          },
          {
            id: "72177720332040305",
            title: "Carnaval cultural 2026 dia 14 (parte 1)",
          },
          {
            id: "72177720332046117",
            title: "Carnaval cultural 2026 dia 14 (parte 2)",
          },
          {
            id: "72177720332047250",
            title: "Carnaval cultural 2026 dia 15 (parte 1)",
          },
          {
            id: "72177720332052742",
            title: "Carnaval cultural 2026 dia 15 (parte 2)",
          },
          {
            id: "72177720332080389",
            title: "Carnaval cultural 2026 dia 15 (parte 3)",
          },
        ],
      },
      {
        key: "2025",
        yearLabel: "2025",
        title: "Carnaval Cultural 2025",
        subtitle: "Album do site com 8 albuns oficiais do Flickr separados dos anos 2024 e 2026.",
        photoCount: 641,
        albums: [
          {
            id: "72177720324254499",
            title: "Carnaval Cultural 2025 (parte 1)",
          },
          {
            id: "72177720324253729",
            title: "Carnaval Cultural 2025 (parte 2)",
          },
          {
            id: "72177720324146660",
            title: "Carnaval Cultural 2025 (parte 3)",
          },
          {
            id: "72177720324169324",
            title: "Carnaval Cultural 2025 (parte 4)",
          },
          {
            id: "72177720324120459",
            title: "Carnaval Cultural 2025 (parte 5)",
          },
          {
            id: "72177720324077660",
            title: "Carnaval Cultural 2025 (parte 6)",
          },
          {
            id: "72177720324233492",
            title: "Carnaval Cultural 2025 (parte 7)",
          },
          {
            id: "72177720324232387",
            title: "Carnaval Cultural 2025 (parte 8)",
          },
        ],
      },
      {
        key: "2024",
        yearLabel: "2024",
        title: "Carnaval Cultural 2024",
        subtitle: "Album do site com 2 albuns oficiais do Flickr separados do material de 2026.",
        photoCount: 211,
        albums: [
          {
            id: "72177720314785873",
            title: "Carnaval Cultural 2024 (parte 1)",
          },
          {
            id: "72177720314807832",
            title: "Carnaval Cultural 2024 (parte 2)",
          },
        ],
      },
      {
        key: "2020",
        yearLabel: "2020",
        title: "Carnaval Cultural 2020",
        subtitle: "Album do site com 1 album oficial do Flickr separado dos anos mais recentes.",
        photoCount: 129,
        albums: [
          {
            id: "72157713280854581",
            title: "Carnaval Cultural 2020",
          },
        ],
      },
      {
        key: "2018",
        yearLabel: "2018",
        title: "Carnaval Cultural 2018",
        subtitle: "Album do site com 3 albuns oficiais do Flickr organizados em uma unica galeria de 2018.",
        photoCount: 201,
        albums: [
          {
            id: "72157692546443834",
            title: "Carnaval Cultural 2018 (parte 1)",
          },
          {
            id: "72157691651933671",
            title: "Carnaval Cultural 2018 (parte 2)",
          },
          {
            id: "72157687810609190",
            title: "Carnaval Cultural 2018 (parte 3)",
          },
        ],
      },
    ],
  },
  "festival-de-forro": {
    title: "Festival de Forró",
    subtitle: "Escolha o ano do Festival de Forró para abrir o album correspondente dentro da aba Galeria.",
    profileUrl: "https://www.flickr.com/photos/prefeituradeamargosa/",
    collections: [
      {
        key: "2025",
        yearLabel: "2025",
        title: "Festival de Forró 2025",
        subtitle: "Album do site com 4 albuns oficiais do Flickr organizados em uma unica galeria de 2025.",
        photoCount: 291,
        albums: [
          {
            id: "72177720325219412",
            title: "Festival de Forró 2025 (parte 1)",
          },
          {
            id: "72177720325389564",
            title: "Festival de Forró 2025 (parte 2)",
          },
          {
            id: "72177720325231198",
            title: "Festival de Forró 2025 (parte 3)",
          },
          {
            id: "72177720325290987",
            title: "Festival de Forró 2025 (parte 4)",
          },
        ],
      },
    ],
  },
  "sao-joao": {
    title: "S\u00e3o Jo\u00e3o",
    subtitle: "Escolha o ano do S\u00e3o Jo\u00e3o para abrir o album correspondente dentro da aba Galeria.",
    profileUrl: "https://www.flickr.com/photos/prefeituradeamargosa/",
    collections: [
      {
        key: "2025",
        yearLabel: "2025",
        title: "S\u00e3o Jo\u00e3o 2025",
        subtitle: "Album do site com 11 albuns oficiais do Flickr organizados em uma unica galeria de 2025.",
        photoCount: 1492,
        albums: [
          {
            id: "72177720327057539",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 1)",
          },
          {
            id: "72177720327096348",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 2)",
          },
          {
            id: "72177720327032410",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 3)",
          },
          {
            id: "72177720327060325",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 4)",
          },
          {
            id: "72177720327124339",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 5)",
          },
          {
            id: "72177720327072305",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 6)",
          },
          {
            id: "72177720327108290",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 7)",
          },
          {
            id: "72177720327104819",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 8)",
          },
          {
            id: "72177720327107921",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 9)",
          },
          {
            id: "72177720327106119",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 10)",
          },
          {
            id: "72177720327129238",
            title: "S\u00e3o Jo\u00e3o 2025 (parte 11)",
          },
        ],
      },
      {
        key: "2024",
        yearLabel: "2024",
        title: "S\u00e3o Jo\u00e3o 2024",
        subtitle: "Album do site com 13 albuns oficiais do Flickr organizados em uma unica galeria de 2024.",
        photoCount: 1361,
        albums: [
          {
            id: "72177720318051277",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 1)",
          },
          {
            id: "72177720318075622",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 2)",
          },
          {
            id: "72177720318084586",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 3)",
          },
          {
            id: "72177720318111449",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 4)",
          },
          {
            id: "72177720318124409",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 5)",
          },
          {
            id: "72177720318117867",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 6)",
          },
          {
            id: "72177720318131775",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 7)",
          },
          {
            id: "72177720318159733",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 8)",
          },
          {
            id: "72177720318168968",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 9)",
          },
          {
            id: "72177720318171467",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 10)",
          },
          {
            id: "72177720318203174",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 11)",
          },
          {
            id: "72177720318224609",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 12)",
          },
          {
            id: "72177720318233659",
            title: "S\u00e3o Jo\u00e3o 2024 (parte 13)",
          },
        ],
      },
      {
        key: "2023",
        yearLabel: "2023",
        title: "S\u00e3o Jo\u00e3o 2023",
        subtitle: "Album do site com 11 albuns oficiais do Flickr organizados em uma unica galeria de 2023.",
        photoCount: 521,
        albums: [
          {
            id: "72177720309253165",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 1)",
          },
          {
            id: "72177720309281048",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 2)",
          },
          {
            id: "72177720309276807",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 3)",
          },
          {
            id: "72177720309302613",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 4)",
          },
          {
            id: "72177720309293021",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 5)",
          },
          {
            id: "72177720309318209",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 6)",
          },
          {
            id: "72177720309312786",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 7)",
          },
          {
            id: "72177720309333347",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 8)",
          },
          {
            id: "72177720309427209",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 9)",
          },
          {
            id: "72177720309427399",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 10)",
          },
          {
            id: "72177720309430954",
            title: "S\u00e3o Jo\u00e3o 2023 (parte 11)",
          },
        ],
      },
      {
        key: "2022",
        yearLabel: "2022",
        title: "S\u00e3o Jo\u00e3o 2022",
        subtitle: "Album do site com 4 albuns oficiais do Flickr organizados em uma unica galeria de 2022.",
        photoCount: 932,
        albums: [
          {
            id: "72177720300084921",
            title: "S\u00e3o Jo\u00e3o 2022 (parte 1)",
          },
          {
            id: "72177720300086915",
            title: "S\u00e3o Jo\u00e3o 2022 (parte 2)",
          },
          {
            id: "72177720300121928",
            title: "S\u00e3o Jo\u00e3o 2022 (parte 3)",
          },
          {
            id: "72177720300119780",
            title: "S\u00e3o Jo\u00e3o 2022 (parte 4)",
          },
        ],
      },
      {
        key: "2019",
        yearLabel: "2019",
        title: "S\u00e3o Jo\u00e3o 2019",
        subtitle: "Album do site com 7 albuns oficiais do Flickr organizados em uma unica galeria de 2019.",
        photoCount: 934,
        albums: [
          {
            id: "72157709146740998",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 1)",
          },
          {
            id: "72157709177084261",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 2)",
          },
          {
            id: "72157709184260592",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 3)",
          },
          {
            id: "72157709197933922",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 4)",
          },
          {
            id: "72157709210237281",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 5)",
          },
          {
            id: "72157709227043391",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 6)",
          },
          {
            id: "72157709240243912",
            title: "S\u00e3o Jo\u00e3o 2019 (parte 7)",
          },
        ],
      },
      {
        key: "2018",
        yearLabel: "2018",
        title: "S\u00e3o Jo\u00e3o 2018",
        subtitle: "Album do site com 5 albuns oficiais do Flickr organizados em uma unica galeria de 2018.",
        photoCount: 778,
        albums: [
          {
            id: "72157696484919491",
            title: "S\u00e3o Jo\u00e3o 2018 (parte 1)",
          },
          {
            id: "72157697688037404",
            title: "S\u00e3o Jo\u00e3o 2018 (parte 2)",
          },
          {
            id: "72157697982531434",
            title: "S\u00e3o Jo\u00e3o 2018 (parte 3)",
          },
          {
            id: "72157692693656990",
            title: "S\u00e3o Jo\u00e3o 2018 (parte 4)",
          },
          {
            id: "72157697985110994",
            title: "S\u00e3o Jo\u00e3o 2018 (parte 5)",
          },
        ],
      },
      {
        key: "2017",
        yearLabel: "2017",
        title: "S\u00e3o Jo\u00e3o 2017",
        subtitle: "Album do site com 5 albuns oficiais do Flickr organizados em uma unica galeria de 2017.",
        photoCount: 899,
        albums: [
          {
            id: "72157685714742376",
            title: "S\u00e3o Jo\u00e3o 2017 (parte 1)",
          },
          {
            id: "72157682753627623",
            title: "S\u00e3o Jo\u00e3o 2017 (parte 2)",
          },
          {
            id: "72157682666382864",
            title: "S\u00e3o Jo\u00e3o 2017 (parte 3)",
          },
          {
            id: "72157685483247916",
            title: "S\u00e3o Jo\u00e3o 2017 (parte 4)",
          },
          {
            id: "72157682511031662",
            title: "S\u00e3o Jo\u00e3o 2017 (parte 5)",
          },
        ],
      },
    ],
  },
};

const userIdCache = new Map<string, string>();

const flickrRetryConfig = {
  attempts: 3,
  baseDelayMs: 800,
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function getFlickrApiKey() {
  const apiKey = Deno.env.get("FLICKR_API_KEY");

  if (!apiKey) {
    throw new Error("Secret FLICKR_API_KEY nao encontrado.");
  }

  return apiKey;
}

function findGallery(galleryKey: string) {
  const gallery = galleries[galleryKey];

  if (!gallery) {
    throw new Error("Galeria solicitada nao foi encontrada.");
  }

  return gallery;
}

function mapCollections(gallery: GalleryDefinition) {
  return gallery.collections.map((collection) => ({
    key: collection.key,
    yearLabel: collection.yearLabel,
    title: collection.title,
    subtitle: collection.subtitle,
    photoCount: collection.photoCount,
    albumCount: collection.albums.length,
  }));
}

async function callFlickr<T>(method: string, params: Record<string, string>) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= flickrRetryConfig.attempts; attempt += 1) {
    try {
      const query = new URLSearchParams({
        method,
        api_key: getFlickrApiKey(),
        format: "json",
        nojsoncallback: "1",
        ...params,
      });

      const response = await fetch(`https://www.flickr.com/services/rest/?${query.toString()}`);

      if (!response.ok) {
        throw new Error(`Flickr retornou status ${response.status}.`);
      }

      const payload = (await response.json()) as FlickrApiResponse<T>;

      if (payload.stat !== "ok") {
        throw new Error(payload.message || "Falha ao consultar o Flickr.");
      }

      return payload;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Falha desconhecida ao consultar o Flickr.");

      const canRetry = attempt < flickrRetryConfig.attempts
        && (
          lastError.message.includes("currently available")
          || lastError.message.includes("temporarily unavailable")
          || lastError.message.includes("status 5")
          || lastError.message.includes("fetch")
        );

      if (!canRetry) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, flickrRetryConfig.baseDelayMs * attempt));
    }
  }

  throw lastError ?? new Error("Falha ao consultar o Flickr.");
}

async function resolveUserId(profileUrl: string) {
  if (userIdCache.has(profileUrl)) {
    return userIdCache.get(profileUrl)!;
  }

  const payload = await callFlickr<{ user: { id: string } }>("flickr.urls.lookupUser", {
    url: profileUrl,
  });

  userIdCache.set(profileUrl, payload.user.id);

  return payload.user.id;
}

function fallbackImageUrl(photo: FlickrPhoto, sizeSuffix: string) {
  return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${sizeSuffix}.jpg`;
}

function normalizePhoto(photo: FlickrPhoto, album: GalleryAlbum, albumIndex: number, photoIndex: number) {
  return {
    id: photo.id,
    title: photo.title?.trim() || "",
    albumId: album.id,
    albumTitle: album.title,
    thumbUrl: photo.url_q || photo.url_m || fallbackImageUrl(photo, "q"),
    imageUrl: photo.url_l || photo.url_o || photo.url_z || photo.url_m || fallbackImageUrl(photo, "b"),
    width: Number(photo.width_l || photo.width_o || photo.width_z || photo.width_m || photo.width_q || 0),
    height: Number(photo.height_l || photo.height_o || photo.height_z || photo.height_m || photo.height_q || 0),
    albumOrder: albumIndex,
    photoOrder: photoIndex,
  };
}

async function fetchAlbumPhotos(album: GalleryAlbum, userId: string, albumIndex: number) {
  const results: ReturnType<typeof normalizePhoto>[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const payload = await callFlickr<{
      photoset: {
        page: number;
        pages: number;
        photo: FlickrPhoto[];
      };
    }>("flickr.photosets.getPhotos", {
      photoset_id: album.id,
      user_id: userId,
      page: String(page),
      per_page: "500",
      extras: [
        "url_q",
        "url_m",
        "url_z",
        "url_l",
        "url_o",
        "width_q",
        "height_q",
        "width_m",
        "height_m",
        "width_z",
        "height_z",
        "width_l",
        "height_l",
        "width_o",
        "height_o",
      ].join(","),
    });

    totalPages = payload.photoset.pages || 1;

    payload.photoset.photo.forEach((photo) => {
      results.push(normalizePhoto(photo, album, albumIndex, results.length));
    });

    page += 1;
  }

  return results;
}

function buildGalleryOverview(galleryKey: string) {
  const gallery = findGallery(galleryKey);

  return {
    mode: "overview",
    galleryKey,
    title: gallery.title,
    subtitle: gallery.subtitle,
    collections: mapCollections(gallery),
    selectedCollection: null,
    albums: [],
    totalPhotos: 0,
    photos: [],
  };
}

async function buildCollectionPayload(galleryKey: string, collectionKey: string) {
  const gallery = findGallery(galleryKey);
  const collection = gallery.collections.find((item) => item.key === collectionKey);

  if (!collection) {
    throw new Error("Ano solicitado nao foi encontrado nesta galeria.");
  }

  const userId = await resolveUserId(gallery.profileUrl);
  const dedupedPhotos = new Map<string, ReturnType<typeof normalizePhoto>>();
  const warnings: GalleryWarning[] = [];

  for (const [albumIndex, album] of collection.albums.entries()) {
    try {
      const albumPhotos = await fetchAlbumPhotos(album, userId, albumIndex);

      albumPhotos.forEach((photo) => {
        if (!dedupedPhotos.has(photo.id)) {
          dedupedPhotos.set(photo.id, photo);
        }
      });
    } catch (error) {
      warnings.push({
        albumId: album.id,
        albumTitle: album.title,
        message: error instanceof Error ? error.message : "Falha desconhecida ao carregar o album.",
      });
    }
  }

  if (!dedupedPhotos.size && warnings.length) {
    throw new Error(warnings[0].message);
  }

  const photos = Array.from(dedupedPhotos.values()).sort((first, second) => {
    if (first.albumOrder !== second.albumOrder) {
      return first.albumOrder - second.albumOrder;
    }

    return first.photoOrder - second.photoOrder;
  });

  const loadedAlbumCount = collection.albums.length - warnings.length;
  const warningMessage = warnings.length
    ? `Alguns albuns deste ano nao puderam ser carregados agora (${loadedAlbumCount} de ${collection.albums.length} albuns carregados).`
    : "";

  return {
    mode: "collection",
    galleryKey,
    title: gallery.title,
    subtitle: gallery.subtitle,
    collections: mapCollections(gallery),
    selectedCollection: {
      key: collection.key,
      yearLabel: collection.yearLabel,
      title: collection.title,
      subtitle: collection.subtitle,
      photoCount: collection.photoCount,
      albumCount: collection.albums.length,
    },
    albums: collection.albums,
    totalPhotos: photos.length,
    warningMessage,
    warnings,
    photos,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Metodo nao suportado. Use POST." },
      { status: 405 },
    );
  }

  try {
    const body = await request.json();
    const galleryKey = typeof body?.galleryKey === "string" ? body.galleryKey : "";
    const collectionKey = typeof body?.collectionKey === "string" ? body.collectionKey : "";

    if (!galleryKey) {
      return jsonResponse(
        { error: "Informe o campo galleryKey no corpo da requisicao." },
        { status: 400 },
      );
    }

    const payload = collectionKey
      ? await buildCollectionPayload(galleryKey, collectionKey)
      : buildGalleryOverview(galleryKey);

    return jsonResponse(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro interno ao montar a galeria." },
      { status: 500 },
    );
  }
});
