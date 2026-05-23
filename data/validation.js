export function validateBoardData(board, existingSlugs = new Set(), existingNames = new Set()) {
  if (!board.slug) throw new Error("Validation Error: 'slug' is required.");
  if (!board.name) throw new Error("Validation Error: 'name' is required.");
  if (!board.categorySlug) throw new Error("Validation Error: 'categorySlug' is required.");
  if (!board.website) throw new Error("Validation Error: 'website' is required.");
  if (!board.logo) throw new Error("Validation Error: 'logo' is required.");
  if (!board.pricingModel) throw new Error("Validation Error: 'pricingModel' is required.");

  const slug = board.slug.trim();
  const name = board.name.trim();

  if (existingSlugs.has(slug)) {
    throw new Error(`Validation Error: Duplicate slug '${slug}' found.`);
  }
  if (existingNames.has(name.toLowerCase())) {
    throw new Error(`Validation Error: Duplicate name '${name}' found.`);
  }

  existingSlugs.add(slug);
  existingNames.add(name.toLowerCase());
}
