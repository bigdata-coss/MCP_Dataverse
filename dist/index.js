import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
console.error('Starting Dataverse MCP server...');
// Create an MCP server
const server = new McpServer({
    name: "Dataverse",
    version: "1.0.0"
});
console.error('Server instance created');
// Add a search tool
server.tool("search", {
    query: z.string(),
    type: z.enum(["dataset", "file"]).optional(),
    per_page: z.number().min(1).max(100).optional()
}, async ({ query, type = "dataset", per_page = 10 }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const searchUrl = new URL("search", apiUrl);
    searchUrl.searchParams.append("q", query);
    searchUrl.searchParams.append("type", type);
    searchUrl.searchParams.append("per_page", per_page.toString());
    const response = await fetch(searchUrl.toString(), {
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
    };
});
console.error('Search tool registered');
// Add a dataset resource
server.resource("dataset", new ResourceTemplate("dataverse://dataset/{id}", { list: undefined }), async (uri, { id }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const datasetUrl = new URL(`datasets/${id}`, apiUrl);
    const response = await fetch(datasetUrl.toString(), {
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        contents: [{
                uri: uri.href,
                text: JSON.stringify(data, null, 2)
            }]
    };
});
console.error('Dataset resource registered');
// Add data access tools
server.tool("downloadDataset", {
    datasetId: z.string(),
    version: z.string().optional(),
    format: z.enum(["original", "archival"]).optional(),
    usePid: z.boolean().optional()
}, async ({ datasetId, version, format = "archival", usePid = false }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const endpoint = usePid
        ? `access/dataset/:persistentId${version ? `/versions/${version}` : ''}?persistentId=${datasetId}&format=${format}`
        : `access/dataset/${datasetId}${version ? `/versions/${version}` : ''}?format=${format}`;
    const response = await fetch(new URL(endpoint, apiUrl).toString(), {
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.blob();
    return {
        content: [{
                type: "text",
                text: `Dataset downloaded successfully. Size: ${data.size} bytes`
            }]
    };
});
console.error('Download dataset tool registered');
server.tool("downloadFile", {
    fileId: z.string(),
    format: z.enum(["original", "RData", "prep", "subset"]).optional(),
    variables: z.string().optional(),
    usePid: z.boolean().optional()
}, async ({ fileId, format, variables, usePid = false }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const endpoint = usePid
        ? `access/datafile/:persistentId?persistentId=${fileId}${format ? `&format=${format}` : ''}${variables ? `&variables=${variables}` : ''}`
        : `access/datafile/${fileId}${format ? `?format=${format}` : ''}${variables ? `&variables=${variables}` : ''}`;
    const response = await fetch(new URL(endpoint, apiUrl).toString(), {
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.blob();
    return {
        content: [{
                type: "text",
                text: `File downloaded successfully. Size: ${data.size} bytes`
            }]
    };
});
console.error('Download file tool registered');
// Add curation label tools
server.tool("getCurationLabel", {
    datasetId: z.string(),
    usePid: z.boolean().optional()
}, async ({ datasetId, usePid = false }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const endpoint = usePid
        ? `datasets/:persistentId/curationStatus?persistentId=${datasetId}`
        : `datasets/${datasetId}/curationStatus`;
    const response = await fetch(new URL(endpoint, apiUrl).toString(), {
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
    };
});
console.error('Get curation label tool registered');
server.tool("setCurationLabel", {
    datasetId: z.string(),
    label: z.string(),
    usePid: z.boolean().optional()
}, async ({ datasetId, label, usePid = false }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const endpoint = usePid
        ? `datasets/:persistentId/curationStatus?persistentId=${datasetId}&label=${encodeURIComponent(label)}`
        : `datasets/${datasetId}/curationStatus?label=${encodeURIComponent(label)}`;
    const response = await fetch(new URL(endpoint, apiUrl).toString(), {
        method: 'PUT',
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
    };
});
console.error('Set curation label tool registered');
server.tool("deleteCurationLabel", {
    datasetId: z.string(),
    usePid: z.boolean().optional()
}, async ({ datasetId, usePid = false }) => {
    const apiUrl = process.env.DATAVERSE_API_URL || "https://dataverse.harvard.edu/api/";
    const apiKey = process.env.DATAVERSE_API_KEY;
    if (!apiKey) {
        throw new Error("DATAVERSE_API_KEY environment variable is required");
    }
    const endpoint = usePid
        ? `datasets/:persistentId/curationStatus?persistentId=${datasetId}`
        : `datasets/${datasetId}/curationStatus`;
    const response = await fetch(new URL(endpoint, apiUrl).toString(), {
        method: 'DELETE',
        headers: {
            "X-Dataverse-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Dataverse API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
    };
});
console.error('Delete curation label tool registered');
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Server connected to transport');
