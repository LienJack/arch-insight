function createPartHeader({ index, total, fileCount }) {
  return [
    `# Context Pack (Part ${index}/${total})`,
    "",
    `Files in this part: ${fileCount}`,
    ""
  ].join("\n");
}

export function splitPackageOutput({ header, sections, maxChars }) {
  if (!Number.isFinite(maxChars) || maxChars <= 0) {
    throw new Error("Split maxChars must be a positive integer.");
  }

  const groups = [];
  let currentGroup = [];
  let currentSize = header.length;

  for (const section of sections) {
    const sectionSize = section.content.length;
    const projectedSize = currentSize + sectionSize;

    if (currentGroup.length > 0 && projectedSize > maxChars) {
      groups.push(currentGroup);
      currentGroup = [];
      currentSize = header.length;
    }

    currentGroup.push(section);
    currentSize += sectionSize;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  if (groups.length === 0) {
    groups.push([]);
  }

  const total = groups.length;

  return groups.map((group, index) => {
    const partNumber = index + 1;
    const partHeader = createPartHeader({
      index: partNumber,
      total,
      fileCount: group.length
    });

    const partBody = group.map((section) => section.content).join("");

    return {
      part: partNumber,
      total,
      files: group.map((section) => section.file),
      content: `${partHeader}${header}${partBody}`
    };
  });
}
