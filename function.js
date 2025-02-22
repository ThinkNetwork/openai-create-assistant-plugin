window.function = async function(api_key, model, name, instructions, tools, file_ids, temperature, top_p, metadata, response_format) {
    // Required field validation
    if (!api_key.value) return "Error: OpenAI API Key is required.";
    if (!model.value) return "Error: Model is required.";
    if (!name.value) return "Error: Assistant name is required.";
    if (!instructions.value) return "Error: Instructions are required.";

    // Parse inputs with default values
    const modelValue = model.value;
    const instructionsValue = instructions.value;
    const toolsValue = tools.value ? tools.value.split(",").map(t => ({ type: t.trim() })) : [];
    const fileIdsValue = file_ids.value ? file_ids.value.split(",").map(id => id.trim()) : [];
    const temperatureValue = temperature.value ?? 1.0;
    const topPValue = top_p.value ?? 1.0;
    const metadataValue = metadata.value ? JSON.parse(metadata.value) : {};
    const responseFormatValue = response_format.value || "auto";

    // Construct tool_resources only if file IDs exist
    let toolResources = {};
    if (fileIdsValue.length > 0) {
        toolResources = {
            file_search: {
                vector_store_ids: fileIdsValue
            }
        };
    }

    // Construct payload
    const payload = {
        model: modelValue,
        name: name.value,
        instructions: instructionsValue,
        tools: toolsValue,
        tool_resources: toolResources,
        temperature: temperatureValue,
        top_p: topPValue,
        metadata: metadataValue,
        response_format: responseFormatValue
    };

    // Make API request
    try {
        const response = await fetch("https://api.openai.com/v1/assistants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${api_key.value}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`;
        }

        // Parse and return response
        const responseData = await response.json();
        return JSON.stringify(responseData, null, 2);

    } catch (error) {
        return `Error: Request failed - ${error.message}`;
    }
};
