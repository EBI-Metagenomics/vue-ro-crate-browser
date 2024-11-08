import JSZip from 'jszip';
import { ROCrate } from 'ro-crate';

const RoCrateSingleton = (() => {
    // Explicitly typed variables
    let trackProperties: {
        name: string;
        type: string;
        format: string;
        displayMode: string;
        initialCrateUrl: string;
        url: string;
        label: string;
        crate: {
            tree: any;
            zip: JSZip;
        };
    } | null = null;

    let trackPropertiesURL: string | null = null;
    let trackCrate: ROCrate | null = null;
    let trackCrateZip: JSZip | null = null;
    let previewHtml: Promise<string> | null = null;
    let currentCrateUrl: string | null = null;
    let specifiedCrateFolder: string | null = null;

    const determineFilePath = (fileName: string): string => {
        return specifiedCrateFolder ? `${specifiedCrateFolder}/${fileName}` : fileName;
    };

    const extractDetailsFromCrateZip = async (crateUrl: string): Promise<void> => {
        console.log('CRATE URL ', crateUrl);
        currentCrateUrl = crateUrl;
        try {
            const response = await fetch(crateUrl);
            if (response.status === 200 || response.status === 0) {
                const blob = await response.blob();
                const crateZip = await JSZip.loadAsync(blob);
                trackCrateZip = crateZip;
                const metadataJson = await crateZip
                    .file(determineFilePath('ro-crate-metadata.json'))
                    ?.async('string');
                if (metadataJson) {
                    const metadata = JSON.parse(metadataJson);
                    trackCrate = new ROCrate(metadata, {
                        link: true,
                        array: true,
                    });
                }
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.error('Error fetching RO crate:', error);
        }
    };

    const getTrackProperties = async (crateUrl: string): Promise<typeof trackProperties> => {
        if (!trackProperties || currentCrateUrl !== crateUrl || !trackCrate) {
            await extractDetailsFromCrateZip(crateUrl);
            if (trackCrate && trackCrateZip) {
                const tree = trackCrate.getNormalizedTree();
                let filePointer: string | undefined;
                tree.hasPart.forEach((dataset: any) => {
                    if (
                        dataset['@type'].includes('File') &&
                        dataset.encodingFormat[0]['@value'].includes('gff')
                    ) {
                        filePointer = dataset['@id'];
                    }
                });
                if (filePointer) {
                    const name = tree.name[0]['@value'].split(' ')[0];
                    const gff = await trackCrateZip
                        .file(determineFilePath(filePointer))
                        ?.async('base64');
                    if (gff) {
                        const trackAttributes = {
                            name,
                            type: 'annotation',
                            format: 'gff3',
                            displayMode: 'EXPANDED',
                            initialCrateUrl: crateUrl,
                            url: `data:application/octet-stream;base64,${gff}`,
                            label: name,
                            crate: {
                                tree,
                                zip: trackCrateZip,
                            },
                        };
                        trackProperties = trackAttributes;
                        trackPropertiesURL = trackAttributes.url;
                    }
                }
            }
        }
        return trackProperties;
    };

    const getTrackPropertiesURL = async (crateUrl: string): Promise<string | null> => {
        if (!trackPropertiesURL) {
            await extractDetailsFromCrateZip(crateUrl);
            await getTrackProperties(crateUrl);
        }
        return trackPropertiesURL;
    };

    const getTrackCrate = async (crateUrl: string): Promise<ROCrate | null> => {
        if (!trackCrate) {
            await extractDetailsFromCrateZip(crateUrl);
        }
        return trackCrate;
    };

    const getPreviewHtml = async (crateUrl: string, specificCrateFolder: string | null = null): Promise<string | null> => {
        specifiedCrateFolder = specificCrateFolder;
        if (!previewHtml || currentCrateUrl !== crateUrl) {
            await extractDetailsFromCrateZip(crateUrl);
        }
        previewHtml = trackCrateZip?.file(determineFilePath('ro-crate-preview.html'))?.async('string') || null;
        return previewHtml;
    };

    const getHtmlContent = async (
        fileName: string,
        crateUrl: string,
        specificCrateFolder: string | null = null
    ): Promise<string | null> => {
        specifiedCrateFolder = specificCrateFolder;
        if (!previewHtml || currentCrateUrl !== crateUrl) {
            await extractDetailsFromCrateZip(crateUrl);
        }
        return trackCrateZip?.file(determineFilePath(fileName))?.async('string') || null;
    };

    return {
        getTrackProperties,
        getTrackPropertiesURL,
        getTrackCrate,
        getPreviewHtml,
        getHtmlContent,
    };
})();

export default RoCrateSingleton;
