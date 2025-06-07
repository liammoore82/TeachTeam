import { AppDataSource } from "../data-source";
import { Profile } from "../entity/Profile";
import { Pet } from "../entity/Pet";

const profileRepository = AppDataSource.getRepository(Profile);
const petRepository = AppDataSource.getRepository(Pet);

export const resolvers = {
  Query: {
    profiles: async () => {
      return await profileRepository.find();
    },
    profile: async (_: any, { id }: { id: string }) => {
      return await profileRepository.findOne({
        where: { profile_id: parseInt(id) },
      });
    },
    pets: async () => {
      return await petRepository.find();
    },
    pet: async (_: any, { id }: { id: string }) => {
      return await petRepository.findOne({ where: { pet_id: parseInt(id) } });
    },
  },
  Mutation: {
    createProfile: async (_: any, args: any) => {
      const profile = profileRepository.create(args);
      return await profileRepository.save(profile);
    },
    updateProfile: async (
      _: any,
      { id, ...args }: { id: string } & Partial<Profile>
    ) => {
      await profileRepository.update(id, args);
      return await profileRepository.findOne({
        where: { profile_id: parseInt(id) },
      });
    },
    deleteProfile: async (_: any, { id }: { id: string }) => {
      const result = await profileRepository.delete(id);
      return result.affected !== 0;
    },
    createPet: async (_: any, { name }: { name: string }) => {
      const pet = petRepository.create({ name });
      return await petRepository.save(pet);
    },
    updatePet: async (_: any, { id, name }: { id: string; name: string }) => {
      await petRepository.update(id, { name });
      return await petRepository.findOne({ where: { pet_id: parseInt(id) } });
    },
    deletePet: async (_: any, { id }: { id: string }) => {
      const result = await petRepository.delete(id);
      return result.affected !== 0;
    },
    addPetToProfile: async (
      _: any,
      { profileId, petId }: { profileId: string; petId: string }
    ) => {
      const profile = await profileRepository.findOne({
        where: { profile_id: parseInt(profileId) },
        relations: ["pets"],
      });
      const pet = await petRepository.findOne({
        where: { pet_id: parseInt(petId) },
      });

      if (!profile || !pet) {
        throw new Error("Profile or Pet not found");
      }

      profile.pets = [...profile.pets, pet];
      return await profileRepository.save(profile);
    },
    removePetFromProfile: async (
      _: any,
      { profileId, petId }: { profileId: string; petId: string }
    ) => {
      const profile = await profileRepository.findOne({
        where: { profile_id: parseInt(profileId) },
        relations: ["pets"],
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      profile.pets = profile.pets.filter(
        (pet) => pet.pet_id !== parseInt(petId)
      );
      return await profileRepository.save(profile);
    },
  },
};
