# Dataverse MCP Server

This project integrates the Harvard Dataverse API with the Model Context Protocol (MCP), enabling AI models to access and search datasets in Dataverse.

## Features

- **Dataset Search**: Search for datasets or files using keywords
- **Dataset Retrieval**: Retrieve detailed information about a specific dataset using its ID
- **Dataset Download**: Download all files from a dataset
- **File Download**: Download specific files in various formats
- **Curation Label Management**: Manage the curation status of datasets

## Installation

```bash
npm install
```

## Environment Variables

Before running the server, you need to set the following environment variables:

- `DATAVERSE_API_KEY`: Dataverse API key (required)
- `DATAVERSE_API_URL`: Dataverse API URL (optional, default: https://dataverse.harvard.edu/api/)

## Configuration

Add the following configuration to your MCP server configuration file:

```json
{
  "mcpServers": {
    "dataverse": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "DATAVERSE_API_URL": "https://dataverse.harvard.edu/api/",
        "DATAVERSE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Running the Server

```bash
npm start
```

## API Endpoints

### Tools

- `search`: Search for datasets or files
  - Parameters:
    - `query`: Search term (string)
    - `type`: Search type ("dataset" or "file", default: "dataset")
    - `per_page`: Results per page (1-100, default: 10)

- `downloadDataset`: Download all files from a dataset
  - Parameters:
    - `datasetId`: Dataset ID or DOI (string)
    - `version`: Version to download (optional, default: latest version)
    - `format`: File format ("original" or "archival", default: "archival")
    - `usePid`: Whether to use DOI (optional, default: false)

- `downloadFile`: Download a specific file
  - Parameters:
    - `fileId`: File ID or DOI (string)
    - `format`: File format ("original", "RData", "prep", "subset", optional)
    - `variables`: List of variables to download (optional, only for "subset" format)
    - `usePid`: Whether to use DOI (optional, default: false)

- `getCurationLabel`: Get a dataset's curation label
  - Parameters:
    - `datasetId`: Dataset ID or DOI (string)
    - `usePid`: Whether to use DOI (optional, default: false)

- `setCurationLabel`: Set a dataset's curation label
  - Parameters:
    - `datasetId`: Dataset ID or DOI (string)
    - `label`: Label to set (string)
    - `usePid`: Whether to use DOI (optional, default: false)

- `deleteCurationLabel`: Delete a dataset's curation label
  - Parameters:
    - `datasetId`: Dataset ID or DOI (string)
    - `usePid`: Whether to use DOI (optional, default: false)

### Resources

- `dataverse://dataset/{id}`: Retrieve a specific dataset by ID

## Error Handling

The server handles the following error scenarios:

- Missing API key
- API request failure
- Invalid dataset ID
- Search parameter errors
- Curation label setting errors
- File download errors

## License

MIT 