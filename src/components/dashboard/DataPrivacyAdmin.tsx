"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Save, X } from "lucide-react";
import Heading from "../ui/Heading";
import ConfirmModal from "../global/media/ConfirmModal";
import toast from "react-hot-toast";

// interface PrivacyPoint {
//   content: string;
// }

interface PrivacySection {
  id?: string;
  title?: string;
  description?: string;
  points?: string[];
}

interface PrivacyPolicy {
  id?: string;
  heading: string;
  order: number;
  isActive: boolean;
  sections?: PrivacySection[];
}

const DataPrivacyAdmin = () => {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicy | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/privacy-policies");
      const data = await response.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching policies:", error);
      setPolicies([]);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = () => {
    setEditingPolicy({
      heading: "",
      order: policies.length + 1,
      isActive: true,
      sections: [],
    });
    setIsCreating(true);
  };

  const handleEdit = (policy: PrivacyPolicy) => {
    setEditingPolicy({ ...policy });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingPolicy) return;

    setLoading(true);
    try {
      const url = isCreating
        ? "/api/privacy-policies"
        : `/api/privacy-policies/${editingPolicy.id}`;
      const method = isCreating ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPolicy),
      });

      if (response.ok) {
        await fetchPolicies();
        setEditingPolicy(null);
        setIsCreating(false);

        if (isCreating) {
          toast.success("Policy created");
        } else {
          toast.success("Policy updated");
        }
      }
    } catch (error) {
      console.error("Error saving policy:", error);
    }
    setLoading(false);
  };

  const addSection = () => {
    if (!editingPolicy) return;
    setEditingPolicy({
      ...editingPolicy,
      sections: [
        ...(editingPolicy.sections || []),
        { title: "", description: "", points: [] },
      ],
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    if (!editingPolicy) return;
    const sections = [...(editingPolicy.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setEditingPolicy({ ...editingPolicy, sections });
  };

  const removeSection = (index: number) => {
    if (!editingPolicy) return;
    const sections = [...(editingPolicy.sections || [])];
    sections.splice(index, 1);
    setEditingPolicy({ ...editingPolicy, sections });
  };

  const addPoint = (sectionIndex: number) => {
    if (!editingPolicy) return;
    const sections = [...(editingPolicy.sections || [])];
    sections[sectionIndex].points = [
      ...(sections[sectionIndex].points || []),
      "",
    ];
    setEditingPolicy({ ...editingPolicy, sections });
  };

  const updatePoint = (
    sectionIndex: number,
    pointIndex: number,
    value: string
  ) => {
    if (!editingPolicy) return;
    const sections = [...(editingPolicy.sections || [])];
    const points = [...(sections[sectionIndex].points || [])];
    points[pointIndex] = value;
    sections[sectionIndex].points = points;
    setEditingPolicy({ ...editingPolicy, sections });
  };

  const removePoint = (sectionIndex: number, pointIndex: number) => {
    if (!editingPolicy) return;
    const sections = [...(editingPolicy.sections || [])];
    const points = [...(sections[sectionIndex].points || [])];
    points.splice(pointIndex, 1);
    sections[sectionIndex].points = points;
    setEditingPolicy({ ...editingPolicy, sections });
  };

  return (
    <div className="p-10">
      <div className="md:flex justify-between items-center mb-6">
        <Heading className="mb-4 text-white">Privacy Policy Management</Heading>
        <Button
          onClick={handleCreate}
          className="flex items-center gap-2 text-white"
        >
          <Plus size={16} /> Add{" "}
          <span className="block md:hidden">new</span> Policy
        </Button>
      </div>

      {editingPolicy && (
        <Card className="mb-6 w-full max-w-none bg-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl">
              {isCreating ? "Create New Policy" : "Edit Policy"}
              {!isCreating && (
                <Button
                  onClick={() => {
                    setEditingPolicy(null);
                    setIsCreating(false);
                  }}
                  className="text-white bg-[#FFD400] hover:bg-yellow-500 flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className=" gap-4 flex flex-col">
              <InputField
                placeholder="Policy Heading"
                value={editingPolicy.heading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingPolicy({
                    ...editingPolicy,
                    heading: e.target.value,
                  })
                }
              />
              <InputField
                type="number"
                placeholder="Order"
                value={editingPolicy.order.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingPolicy({
                    ...editingPolicy,
                    order: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editingPolicy.isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingPolicy({
                    ...editingPolicy,
                    isActive: e.target.checked,
                  })
                }
              />
              <label htmlFor="isActive" className="font-medium">
                Active {editingPolicy.isActive ? "✓" : "✗"}
              </label>
            </div> */}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sections</h3>
                <Button className="text-white" onClick={addSection}>
                  Add Section
                </Button>
              </div>

              {editingPolicy.sections?.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="p-4 w-full max-w-none">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <InputField
                          placeholder="Section Title"
                          value={section.title || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateSection(sectionIndex, "title", e.target.value)
                          }
                        />
                        <TextArea
                          placeholder="Section Description"
                          value={section.description || ""}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            updateSection(
                              sectionIndex,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Button
                        onClick={() => removeSection(sectionIndex)}
                        className="ml-2 text-white"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Points</h4>
                        <Button
                          className="text-white"
                          onClick={() => addPoint(sectionIndex)}
                        >
                          Add Point
                        </Button>
                      </div>

                      {section.points?.map((point, pointIndex) => (
                        <div key={pointIndex} className="w-full max-w-none ">
                          <TextArea
                            placeholder="Point content"
                            value={point}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                              updatePoint(
                                sectionIndex,
                                pointIndex,
                                e.target.value
                              )
                            }
                            className="flex-1 w-full max-w-none"
                          />
                          <Button
                            className="text-white"
                            onClick={() =>
                              removePoint(sectionIndex, pointIndex)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-6">
              <Button
                onClick={() => {
                  setEditingPolicy(null);
                  setIsCreating(false);
                }}
                className="text-white bg-[#FFD400] hover:bg-yellow-500 flex items-center"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={loading ? undefined : handleSave}
                className={
                  loading
                    ? "text-white opacity-50 cursor-not-allowed flex items-center"
                    : "text-white flex items-center"
                }
              >
                <Save size={16} className="mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {Array.isArray(policies) &&
          policies.map((policy) => (
            <Card
              key={policy.id}
              className={
                !policy.isActive
                  ? "opacity-60 border-gray-300 flex justify-center mx-auto w-full bg-gray-300"
                  : " flex justify-center mx-auto w-full bg-gray-400"
              }
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={!policy.isActive ? "text-gray-500" : "text-lg"}
                    >
                      {policy.heading}
                    </span>
                    {!policy.isActive && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(policy)}
                      className="text-white"
                    >
                      Update
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Policy No. : </span>
                      {policy.order}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Status: </span>
                      <span
                        className={
                          policy.isActive
                            ? "text-green-700 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {policy.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold"> Sections: </span>
                      {policy.sections?.length || 0}
                    </p>
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        setDeleteId(policy.id!);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!deleteId) return;

          try {
            const response = await fetch(`/api/privacy-policies/${deleteId}`, {
              method: "DELETE",
            });

            if (response.ok) {
              await fetchPolicies();
              toast.success("Policy has been deleted");
            } else {
              toast.error("Failed to delete policy");
            }
          } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Something went wrong");
          }

          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        title="Delete Policy?"
        description="Are you sure you want to delete this policy? This action cannot be undone."
      />
    </div>
  );
};

export default DataPrivacyAdmin;
