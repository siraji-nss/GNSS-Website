import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function TargetCountriesAdmin() {
  return (
    <SimpleCollectionEditor
      title="Target Countries (Homepage cards)"
      endpoint="/target-countries"
      helpText="Slug should match the corresponding Country Service Page slug so cards link correctly."
      fields={[
        { key: 'name', label: 'Country', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },
        { key: 'tagline', label: 'Tagline', type: 'text' },
        { key: 'highlight', label: 'Highlight badge', type: 'text' },
        { key: 'image_url', label: 'Image', type: 'image' },
        { key: 'sort_order', label: 'Order', type: 'number' },
        { key: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
