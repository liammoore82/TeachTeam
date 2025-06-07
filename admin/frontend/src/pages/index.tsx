import { useState } from "react";
import { useEffect } from "react";
import { Pet, petService } from "../services/api";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    petService.getAllPets().then(setPets);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Pets</h1>

      <ul>
        {pets.map((pet) => (
          <li key={pet.pet_id}>
            <p>{pet.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
