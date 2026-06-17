import type { FastifyInstance, FastifyRequest } from "fastify"

// --- BASIS DATA CMS MANUAL ---
const manualCmsDatabase: Record<string, string> = {
    "movie_1339713": "https://vidsrc.to/embed/movie/1339713", 
}

interface CmsQuery {
    type: string;
    id: string;
    s?: string;
    e?: string;
}

export async function registerApiRoutes(app: FastifyInstance) {
    app.get("/api/cms", async (request: FastifyRequest<{ Querystring: CmsQuery }>, reply) => {
        const { type, id, s, e } = request.query;

        // Validasi input minimal
        if (!type || !id) {
            return reply.status(400).send({ success: false, message: "Missing type or id" });
        }
        
        let dbKey = type === "tv" ? `tv_${id}_${s}_${e}` : `movie_${id}`;
        const manualUrl = manualCmsDatabase[dbKey];

        if (manualUrl) {
            return reply.send({
                success: true,
                data: {
                    id: `cms_${dbKey}`,
                    url: manualUrl,
                    type: "iframe", 
                    streamable: true,
                    quality: "HD", // Default kualitas untuk link manual
                    provider: {
                        id: "server_manual",
                        name: "Server 1 (VIP)"
                    }
                }
            });
        }

        return reply.send({ success: false, data: null });
    })
}
