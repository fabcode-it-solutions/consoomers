const mediaService = {
  deleteMediaById: async (id: string) => {
    try {
      const deleteMediaRes = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const deleteMedia = await deleteMediaRes.json();
      console.log(deleteMedia);
      return deleteMedia;
    } catch (error) {
      if (process.env.NODE_ENV != "production") {
        console.error(error);
      }
      return "Something went wrong try again later!";
    }
  },
};

export default mediaService;
