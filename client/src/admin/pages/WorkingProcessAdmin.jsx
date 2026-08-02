import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function WorkingProcessAdmin() {
  return (
    <SimpleCollectionEditor
      title="Working Process Steps (Homepage)"
      endpoint="/working-process-steps"
      fields={[
        { key: 'step_number', label: 'Step #', type: 'number' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'sort_order', label: 'Order', type: 'number' },
      ]}
    />
  );
}
