/**
 * APIFeatures class
 * Provides reusable query building utilities:
 * - search (text match)
 * - filter (by field values)
 * - sort
 * - paginate
 * - field selection
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ─── Text Search ─────────────────────────────────────────────────────────────
  search() {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.trim();
      this.query = this.query.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { brand: { $regex: keyword, $options: 'i' } },
          { model: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  // ─── Filter ───────────────────────────────────────────────────────────────────
  filter() {
    const queryObj = { ...this.queryString };

    // Fields to exclude from filtering (they have special handling)
    const excludedFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Price range filter
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      queryObj.price = {};
      if (this.queryString.minPrice) queryObj.price.$gte = Number(this.queryString.minPrice);
      if (this.queryString.maxPrice) queryObj.price.$lte = Number(this.queryString.maxPrice);
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Year range filter
    if (this.queryString.minYear || this.queryString.maxYear) {
      queryObj.year = {};
      if (this.queryString.minYear) queryObj.year.$gte = Number(this.queryString.minYear);
      if (this.queryString.maxYear) queryObj.year.$lte = Number(this.queryString.maxYear);
      delete queryObj.minYear;
      delete queryObj.maxYear;
    }

    // Availability filter
    if (this.queryString.available === 'true') {
      queryObj.stockQuantity = { $gt: 0 };
      queryObj.status = 'available';
      delete queryObj.available;
    }

    // Convert operators (gt, gte, lt, lte) to MongoDB format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // ─── Sort ─────────────────────────────────────────────────────────────────────
  sort() {
    if (this.queryString.sort) {
      const sortMap = {
        price_asc: 'price',
        price_desc: '-price',
        newest: '-year',
        oldest: 'year',
        name_asc: 'name',
        name_desc: '-name',
        createdAt_desc: '-createdAt',
        createdAt_asc: 'createdAt',
      };
      const sortBy = sortMap[this.queryString.sort] || this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ─── Field Limiting ───────────────────────────────────────────────────────────
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // ─── Pagination ───────────────────────────────────────────────────────────────
  paginate(defaultLimit = 12) {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || defaultLimit;
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
