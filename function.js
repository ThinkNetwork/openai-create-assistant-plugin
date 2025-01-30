window.function = async function(api_key, model, name, description, instructions, tools, file_ids, temperature) {
    // Validate API Key
    if (!api_key.value) {
        return "Error: API Key is required.";
    }

    // Validate required fields
    if (!name.value) {
        return "Error: Assistant name is required.";
    }

    // Parse inputs
    const modelValue = model.value || "gpt-4o";
    const instructionsValue = instructions.value || "You are a helpful assistant.";
    const toolsValue = tools.value ? tools.value.split(",").map(t => ({ type: t.trim() })) : [];
    const fileIdsValue = file_ids.value ? file_ids.value.split(",").map(id => id.trim()) : [];
    const temperatureValue = temperature.value ?? 1.0;

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
        description: description.value || null,
        instructions: instructionsValue,
        tools: toolsValue,
        tool_resources: toolResources,
        temperature: temperatureValue
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
