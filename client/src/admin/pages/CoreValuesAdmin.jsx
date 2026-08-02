import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function CoreValuesAdmin() {
  return (
    <SimpleCollectionEditor
      title="Core Values (About page)"
      endpoint="/core-values"
      fields={[
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'sort_order', label: 'Order', type: 'number' },
      ]}
    />
  );
}
